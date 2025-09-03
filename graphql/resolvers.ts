import Hotel from '../models/hotels/hotels.js';
import BusinessUser from '../models/businessUsers.js';
import GuestUser from '../models/guest/guestUsers.js';
import Support from '../models/support.js';
import Feedbacks from '../models/feedbacks.js';
import { io } from '../app.js';
import { generateToken } from '../utils/jwt.js';
import redisClient from '../utils/redisClient.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import webpush from '../utils/webpush.js';

import type {
  HotelType,
  GuestUserType,
  BusinessUserType,
  FeedbackType,
  SupportType,
  ChatRoomMessage,
  HousekeepingItem,
  ChecklistItem,
  FeedbackCategory,
  HotelFieldItem
} from '../types/type.js';

const transporter = nodemailer.createTransport({
  host: process.env.IONOS_SMTP_HOST,      // ou 'smtp.ionos.com' selon ton domaine
  port: Number(process.env.IONOS_SMTP_PORT) || 587,                  // 587 pour STARTTLS (recommandé), sinon 465 pour SSL
  secure: false,              // false pour STARTTLS (port 587)
  auth: {
    user: process.env.IONOS_AUTH, // ton adresse mail IONOS complète
    pass: process.env.IONOS_PASSWORD,         // ton mot de passe
  },
  tls: {
    rejectUnauthorized: false // utile si des erreurs de certificat apparaissent
  }
});

export const resolvers = {
  Query: {
    /*
      Récupère tous les hôtels
      @returns {Promise<Hotel[]>} Liste des hôtels
    */
    getHotels: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      return await Hotel.find();
    },
    getHotelById: async (_: any, { id }: any, context: any) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      return await Hotel.findById(id);
    },
    getFeedbacks: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      return await Feedbacks.find();
    },
    getFeedbackById: async (_: any, { id }: any, context: any) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      return await Feedbacks.findOne({hotelId: id});
    },
    getSupports: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      return await Support.find();
    },
    getSupportById: async (_: any, { id }: any, context: any) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      return await Support.findOne({hotelId: id});
    },
    getBusinessUsers: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      return await BusinessUser.find();
    },
    getBusinessUserById: async (_: any, { id }: any, context: any) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      return await BusinessUser.findOne({userId: id});
    },

    // Combined user queries
    getGuestUsers: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const guestUsers = await GuestUser.find();
      return guestUsers
    },
    getGuestUserById: async (_: any, { id }: any, context: any) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const guestUser = await GuestUser.findOne({userId: id});
      return guestUser;
    },
  },

  Mutation: {
    loginUser: async (
      _: unknown,
      { email, password, userCategory }: { email: string; password: string, userCategory: string }
    ): Promise<{ token: string }> => {
      const user = userCategory === 'business' ? await BusinessUser.findOne({ email }) : await GuestUser.findOne({ email });
      if (!user) throw new Error("User not found");
      console.log('PASSWORD', password);
      console.log('USER PASSWORD', user);

      // const isMatch = await bcrypt.compare(password, user.password as any);

      const isMatch = password === user?.password; // For simplicity, using direct comparison. Replace with bcrypt.compare in production.
      if (!isMatch) throw new Error("Invalid credentials");
      console.log('IS MATCH', isMatch);

      const token = generateToken({ userId: user?.id });
      return { token };
    },

    
    logoutUser: async (_: unknown, __: unknown, context: any): Promise<boolean> => {
      const authHeader = context.req.headers.authorization;
    
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Authorization header missing');
      }
    
      const token = authHeader.split(' ')[1];
    
      const expirySeconds = 60 * 60; // Exemple : 1h
    
      try {
        await redisClient.set(`blacklist:${token}`, '1', { EX: expirySeconds });
        return true;
      } catch (err) {
        console.error('Redis error:', err);
        throw new Error('Logout failed');
      }
    },

    createHotel: async (_: unknown, { input }: { input: HotelType }, context: any): Promise<HotelType> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const newHotel = new Hotel(input);
      return await newHotel.save();
    },
    updateHotel: async (_: unknown, { id, input }: { id: string, input: Partial<HotelType> }, context: any): Promise<HotelType | null> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      return await Hotel.findByIdAndUpdate(id, input, { new: true });
    },

    deleteHotel: async (_: unknown, { id }: { id: string }, context: any): Promise<string> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const result = await Hotel.findByIdAndDelete(id);
      return "Hotel deleted";
    },
    // New mutations for updating specific hotel fields
    addHotelFieldItem: async (
      _: unknown,
      { hotelId, field, item }: { hotelId: string; field: string; item: HotelFieldItem },
      context: any
    ): Promise<HotelType> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const allowedFields = ['cab', 'note', 'sticker', 'clock', 'safe', 'roomChange', 'maintenance', 'lostAndFound', 'chat'];
    
      if (!allowedFields.includes(field)) {
        throw new Error(`${field} is not allowed or is not a list field`);
      }
    
      const hotel: any = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
    
      if (!Array.isArray(hotel[field])) {
        throw new Error(`${field} is not an array`);
      }
    
      hotel[field].push(item);
      await hotel.save();
      io.to(hotelId).emit(`${field}Added`, item);
      return hotel;
    },
    removeHotelFieldItem: async (
      _: unknown,
      { hotelId, field, itemId }: { hotelId: string; field: string; itemId: string },
      context: any
    ): Promise<HotelType> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const allowedFields = ['cab', 'note', 'sticker', 'clock', 'safe', 'roomChange', 'maintenance', 'lostAndFound', 'chat'];

      if (!allowedFields.includes(field)) {
        throw new Error(`${field} is not allowed or is not a list field`);
      }

      const hotel: any = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      if (!Array.isArray(hotel[field])) {
        throw new Error(`${field} is not an array`);
      }

      const item = hotel[field].find((item: any) => item.id === itemId);
      if (!item) {
        throw new Error(`Item with ID ${itemId} not found in ${field}`);
      }

      item.deleteOne();
      await hotel.save();
      io.to(hotelId).emit(`${field}Removed`, itemId);
      return hotel;
    },
    updateHotelFieldItem: async (
      _: unknown,
      { hotelId, field, itemId, updates }: { hotelId: string; field: string; itemId: string; updates: Partial<HotelFieldItem> },
      context: any
    ): Promise<HotelFieldItem> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const allowedFields = ['cab', 'note', 'sticker', 'clock', 'safe', 'roomChange', 'maintenance', 'lostAndFound', 'chat'];

      if (!allowedFields.includes(field)) {
        throw new Error(`${field} is not allowed or is not a list field`);
      }

      const hotel: HotelType = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      if (!Array.isArray(hotel[field])) {
        throw new Error(`${field} is not an array`);
      }

      const item = hotel[field].find((item: any) => item.id === itemId);
      if (!item) {
        throw new Error(`Item with ID ${itemId} not found in ${field}`);
      }

      Object.assign(item, updates);
      await hotel.save();
      io.to(hotelId).emit(`${field}Updated`, item);
      return item;
    },

    createChecklist: async (
      _: unknown,
      { hotelId, checklist }: { hotelId: string; checklist: Record<string, ChecklistItem[]> },
      context: any
    ): Promise<Record<string, ChecklistItem[]>> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
        const hotel: any = await Hotel.findById(hotelId);
        if (!hotel) throw new Error("Hotel not found");

        hotel.checklist = checklist;
        await hotel.save();
        io.to(hotelId).emit(`checklistUpdated`, hotel.checklist);
        return hotel.checklist;
    },
    addChecklistItem: async (
      _: unknown,
      { hotelId, period, item }: { hotelId: string; period: string; item: ChecklistItem },
      context: any
    ): Promise<ChecklistItem> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
        const hotel: any = await Hotel.findById(hotelId);
        if (!hotel) throw new Error("Hotel not found");

        if (!hotel.checklist[period]) hotel.checklist[period] = [];
        hotel.checklist[period].push(item);
        await hotel.save();
        io.to(hotelId).emit(`checklistItemAdded`, { period, item });
        return item;
    },
    updateChecklistItem: async (
      _: unknown,
      { hotelId, period, itemId, updates }: { hotelId: string; period: string; itemId: string; updates: Partial<ChecklistItem> },
      context: any
    ): Promise<ChecklistItem> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
        const hotel: any = await Hotel.findById(hotelId);
        if (!hotel) throw new Error("Hotel not found");

        const item = hotel.checklist[period]?.id(itemId);
        if (!item) throw new Error("Checklist item not found");

        Object.assign(item, updates);
        await hotel.save();
        io.to(hotelId).emit(`checklistItemUpdated`, { period, item });
        return item;
    },
    deleteChecklistItem: async (
      _: unknown,
      { hotelId, period, itemId }: { hotelId: string; period: string; itemId: string },
      context: any
    ): Promise<string> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
        const hotel: any = await Hotel.findById(hotelId);
        if (!hotel) throw new Error("Hotel not found");

        hotel.checklist[period].pull(itemId);
        await hotel.save();
        io.to(hotelId).emit(`checklistItemDeleted`, { period, itemId });
        return "Item deleted";
    },

    // Chat-specific mutations
    removeChatFromHotel: async (
      _: unknown,
      { hotelId, userId }: { hotelId: string; userId: string },
      context: any
    ): Promise<HotelType> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const hotel: any = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      hotel.chat = hotel.chat.filter((c: { userId: string; }) => c.userId !== userId);
      await hotel.save();
      io.to(hotelId).emit(`chatRemoved`, userId);
      return hotel;
    },

    addMessageToChatRoom: async (
      _: unknown,
      { hotelId, userId, message }: { hotelId: string; userId: string; message: ChatRoomMessage },
      context: any
    ): Promise<any> => { // TODO: Replace 'any' with proper Chat type if available
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const hotel: any = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      const chatEntry = hotel.chat.find((c: any) => c.userId === userId);
      if (!chatEntry) throw new Error("Chat not found for user");

      chatEntry.chatRoom.push(message);
      await hotel.save();
      io.to(hotelId).emit(`chatRoomMessageAdded`, { userId, message });
      return chatEntry;
    },

    updateChatRoomMessage: async (
      _: unknown,
      { hotelId, userId, messageId, updates }: { hotelId: string; userId: string; messageId: string; updates: Partial<ChatRoomMessage> },
      context: any
    ): Promise<ChatRoomMessage> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const hotel: any = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      const chatEntry = hotel.chat.find((c: any) => c.userId === userId);
      if (!chatEntry) throw new Error("Chat not found for user");

      const message = chatEntry.chatRoom.id(messageId);
      if (!message) throw new Error("Message not found");

      Object.assign(message, updates);
      await hotel.save();
      io.to(hotelId).emit(`chatRoomMessageUpdated`, { userId, message });
      return message;
    },

    deleteChatRoomMessage: async (
      _: unknown,
      { hotelId, userId, messageId }: { hotelId: string; userId: string; messageId: string },
      context: any
    ): Promise<any> => { // TODO: Replace 'any' with proper Chat type if available
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const hotel: any = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      const chatEntry = hotel.chat.find((c: any) => c.userId === userId);
      if (!chatEntry) throw new Error("Chat not found for user");

      const message = chatEntry.chatRoom.id(messageId);
      if (!message) throw new Error("Message not found");

      message.deleteOne();
      await hotel.save();
      io.to(hotelId).emit(`chatRoomMessageDeleted`, { userId, messageId });
      return chatEntry;
    },

    addChatToHotel: async (
      _: unknown,
      { hotelId, chat }: { hotelId: string; chat: any }, // TODO: Define Chat type in types.ts
      context: any
    ): Promise<HotelType> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const hotel: any = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      hotel.chat.push(chat);
      await hotel.save();
      io.to(hotelId).emit(`chatAdded`, chat);
      return hotel;
    },

    updateChatFromHotel: async (
      _: unknown,
      { hotelId, userId, updates }: { hotelId: string; userId: string; updates: Partial<any> }, // TODO: Replace 'any' with Chat type
      context: any
    ): Promise<any> => { // TODO: Replace 'any' with Chat type
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const hotel: any = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      const chatEntry = hotel.chat.find((c: any) => c.userId === userId);
      if (!chatEntry) throw new Error("Chat not found");

      Object.assign(chatEntry, updates);
      await hotel.save();
      io.to(hotelId).emit(`chatUpdated`, { userId, updates });
      return chatEntry;
    },

    // Housekeeping-specific mutations
    addHousekeepingItem: async (
      _: unknown,
      { hotelId, category, item }: { hotelId: string; category: string; item: HousekeepingItem },
      context: any
    ): Promise<HousekeepingItem[]> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const hotel: any = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      const housekeepingCategories = ['towel', "pillow", "blanket", "soap", "babyBed", "iron", "toiletPaper", "hairDryer"];
      if (!housekeepingCategories.includes(category)) {
        throw new Error(`${category} is not a valid housekeeping category`);
      }

      if (!hotel.housekeeping[category]) {
        throw new Error(`${category} is not a valid housekeeping category`);
      }

      hotel.housekeeping[category].push(item);
      await hotel.save();
      io.to(hotelId).emit(`housekeepingItemAdded`, { category, item });
      return hotel.housekeeping[category];
    },

    updateHousekeepingItem: async (
      _: unknown,
      { hotelId, category, itemId, updates }: { hotelId: string; category: string; itemId: string; updates: Partial<HousekeepingItem> },
      context: any
    ): Promise<HousekeepingItem> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const hotel: any = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      const housekeepingCategories = ['towel', "pillow", "blanket", "soap", "babyBed", "iron", "toiletPaper", "hairDryer"];
      if (!housekeepingCategories.includes(category)) {
        throw new Error(`${category} is not a valid housekeeping category`);
      }

      const item = hotel.housekeeping[category]?.id(itemId);
      if (!item) throw new Error("Housekeeping item not found");

      Object.assign(item, updates);
      await hotel.save();
      io.to(hotelId).emit(`housekeepingItemUpdated`, { category, item });
      return item;
    },

    removeHousekeepingItem: async (
      _: unknown,
      { hotelId, category, itemId }: { hotelId: string; category: string; itemId: string },
      context: any
    ): Promise<HousekeepingItem[]> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const hotel: HotelType = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      const housekeepingCategories = ['towel', "pillow", "blanket", "soap", "babyBed", "iron", "toiletPaper", "hairDryer"];
      if (!housekeepingCategories.includes(category)) {
        throw new Error(`${category} is not a valid housekeeping category`);
      }

      if (!Array.isArray(hotel.housekeeping[category])) {
        throw new Error(`${category} is not a valid housekeeping category`);
      }

      const item = hotel.housekeeping[category].find((item: any) => item.id === itemId);
      if (!item) throw new Error("Item not found");

      item.deleteOne();
      await hotel.save();
      io.to(hotelId).emit(`housekeepingItemRemoved`, { category, itemId });
      return hotel.housekeeping[category];
    },

    // Feedback mutations
    createFeedback: async (
      _: unknown,
      { input }: { input: FeedbackType },
      context: any
    ): Promise<FeedbackType> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const newFeedback = new Feedbacks(input);
      const savedFeedback = await newFeedback.save();
      io.to(savedFeedback.hotelId).emit(`feedbackCreated`, savedFeedback);
      return savedFeedback;
    },
    updateFeedback: async (
      _: unknown,
      { id, input }: { id: string; input: Partial<FeedbackType> },
      context: any
    ): Promise<FeedbackType | null> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const updatedFeedback = await Feedbacks.findByIdAndUpdate(id, input, { new: true });
      if (updatedFeedback) {
        io.to(updatedFeedback.hotelId).emit(`feedbackUpdated`, updatedFeedback);
      }
      return updatedFeedback;
    },
    deleteFeedback: async (
      _: unknown,
      { id }: { id: string },
      context: any
    ): Promise<boolean> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const feedback: any = await Feedbacks.findById(id);
      if (!feedback) throw new Error("Feedback not found");
      await Feedbacks.findByIdAndDelete(id);
      io.to(feedback.hotelId).emit(`feedbackDeleted`, id);
      return true;
    },

    // Feedback Category mutations (generic for satisfaction & improvement)
    addFeedbackCategoryItem: async (
      _: unknown,
      { feedbackId, field, category }: { feedbackId: string; field: string; category: FeedbackCategory },
      context: any
    ): Promise<FeedbackType> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const allowedFields = ['satisfaction', 'improvement'];
      if (!allowedFields.includes(field)) {
        throw new Error(`${field} is not a valid category field`);
      }

      const feedback: any = await Feedbacks.findOne({hotelId: feedbackId});
      if (!feedback) throw new Error("Feedback not found");

      feedback[field].push(category);
      await feedback.save();
      io.to(feedback.hotelId).emit(`feedbackCategoryItemAdded`, { field, category });
      return feedback;
    },

    updateFeedbackCategoryItem: async (
      _: unknown,
      { feedbackId, field, itemId, updates }: { feedbackId: string; field: string; itemId: string; updates: Partial<FeedbackCategory> },
      context: any
    ): Promise<FeedbackCategory> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const allowedFields = ['satisfaction', 'improvement'];
      if (!allowedFields.includes(field)) {
        throw new Error(`${field} is not a valid category field`);
      }

      const feedback: any = await Feedbacks.findOne({hotelId: feedbackId});
      if (!feedback) throw new Error("Feedback not found");

      const item = feedback[field].id(itemId);
      if (!item) throw new Error("Category item not found");

      Object.assign(item, updates);
      await feedback.save();
      io.to(feedback.hotelId).emit(`feedbackCategoryItemUpdated`, { field, item });
      return item;
    },

    removeFeedbackCategoryItem: async (
      _: unknown,
      { feedbackId, field, itemId }: { feedbackId: string; field: string; itemId: string },
      context: any
    ): Promise<FeedbackType> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const allowedFields = ['satisfaction', 'improvement'];
      if (!allowedFields.includes(field)) {
        throw new Error(`${field} is not a valid category field`);
      }

      const feedback: any = await Feedbacks.findOne({hotelId: feedbackId});
      if (!feedback) throw new Error("Feedback not found");

      const item = feedback[field].id(itemId);
      if (!item) throw new Error("Category item not found");

      item.deleteOne();
      await feedback.save();
      io.to(feedback.hotelId).emit(`feedbackCategoryItemRemoved`, { field, itemId });
      return feedback;
    },

    // GuestUser mutations
    createGuestUser: async (
      _: unknown,
      { input }: { input: GuestUserType },
      context: any
    ): Promise<GuestUserType> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const newGuestUser = new GuestUser(input);
      return await newGuestUser.save();
    },
    updateGuestUser: async (
      _: unknown,
      { id, input }: { id: string; input: Partial<GuestUserType> },
      context: any
    ): Promise<GuestUserType | null> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      return await GuestUser.findByIdAndUpdate(id, input, { new: true });
    },
    deleteGuestUser: async (
      _: unknown,
      { id }: { id: string },
      context: any
    ): Promise<boolean> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      await GuestUser.findByIdAndDelete(id);
      return true;
    },

    // BusinessUser mutations
    createBusinessUser: async (
      _: unknown,
      { input }: { input: BusinessUserType },
      context: any
    ): Promise<BusinessUserType> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const newBusinessUser = new BusinessUser(input);
      return await newBusinessUser.save();
    },
    updateBusinessUser: async (
      _: unknown,
      { id, input }: { id: string; input: Partial<BusinessUserType> },
      context: any
    ): Promise<BusinessUserType | null> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      return await BusinessUser.findByIdAndUpdate(id, input, { new: true });
    },
    deleteBusinessUser: async (
      _: unknown,
      { id }: { id: string },
      context: any
    ): Promise<boolean> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      await BusinessUser.findByIdAndDelete(id);
      return true;
    },

    // Support-specific mutations
    createSupport: async (
      _: unknown,
      { input }: { input: SupportType },
      context: any
    ): Promise<SupportType> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const newSupport = new Support(input);
      const savedSupport = await newSupport.save();
      io.to(savedSupport.hotelId).emit(`supportCreated`, savedSupport);
      return savedSupport;
    },
    updateSupport: async (
      _: unknown,
      { id, updates }: { id: string; updates: Partial<SupportType> },
      context: any
    ): Promise<SupportType | null> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const updatedSupport = await Support.findByIdAndUpdate(id, updates, { new: true });
      if (updatedSupport) {
        io.to(updatedSupport.hotelId).emit(`supportUpdated`, updatedSupport);
      }
      return updatedSupport;
    },
    deleteSupport: async (
      _: unknown,
      { id }: { id: string },
      context: any
    ): Promise<boolean> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const support = await Support.findById(id);
      if (!support) throw new Error("Support not found");
      await Support.findByIdAndDelete(id);
      io.to(support.hotelId).emit(`supportDeleted`, id);
      return true;
    },
    addMessageToSupportChatRoom: async (
      _: unknown,
      { supportId, message }: { supportId: string; message: any }, // TODO: Define SupportChatRoomMessage type in types.ts
      context: any
    ): Promise<SupportType> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const support = await Support.findOne({hotelId: supportId});
      if (!support) throw new Error("Support not found");

      support.chatRoom.push(message);
      await support.save();
      io.to(supportId).emit(`supportChatRoomMessageAdded`, message);
      return support;
    },
    updateSupportChatRoomMessage: async (
      _: unknown,
      { supportId, messageId, updates }: { supportId: string; messageId: string; updates: Partial<any> }, // TODO: Define SupportChatRoomMessage type
      context: any
    ): Promise<any> => { // TODO: Replace 'any' with SupportChatRoomMessage type
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const support = await Support.findOne({hotelId: supportId});
      if (!support) throw new Error("Support not found");

      const message = support.chatRoom.id(messageId);
      if (!message) throw new Error("Message not found");

      Object.assign(message, updates);
      await support.save();
      io.to(supportId).emit(`supportChatRoomMessageUpdated`, message);
      return message;
    },
    deleteSupportChatRoomMessage: async (
      _: unknown,
      { supportId, messageId }: { supportId: string; messageId: string },
      context: any
    ): Promise<SupportType> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const support = await Support.findOne({hotelId: supportId});
      if (!support) throw new Error("Support not found");

      const message = support.chatRoom.id(messageId);
      if (!message) throw new Error("Message not found");

      message.deleteOne();
      await support.save();
      io.to(supportId).emit(`supportChatRoomMessageDeleted`, messageId);
      return support;
    },

    sendCheckInEmail: async (
      _: unknown,
      { senderEmail, email, appLink, logo, hotelName }: { senderEmail: string,email: string; appLink: string; logo: string, hotelName: string },
      context: any
    ): Promise<boolean> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }

      try {
        await transporter.sendMail({
          from: senderEmail,
          to: email,
          subject: 'E-mail de bienvenue',
          html: `<div><p>Cher.e client.e,</p><p>Vous êtes sur le point de séjourner chez nous et nous tenions à vous remercier pour toute la confiance que vous nous accordez.</p><p>C'est avec beaucoup d'enthousiasme et de plaisir que nous attendons votre arrivée au sein de notre établissement.</p><p>Ce mail a pour object d'établir un premier contact avec vous afin de recueillir vos attentes concernant le séjour.</p><p>Vous trouverez-ci dessous un lien menant vers le portail de notre application web (auncun téléchargement n'est requis pour y accéder). <br/>Celle-ci dispose d'une messagerie instantanée vous permettant de dialoguer directement avec notre personnel qui sera ravi de répondre à vos attentes.</p><p>Nous vous souhaitons une excellente journée.</p><a href=${appLink}>Cliquez ici pour accéder à notre application web</a><div><br/><br/><img src=${logo} width='100' height="100" /><p>${hotelName}</p></div></div>`,
        });
        return true;
      } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
      }
    },

    sendCheckOutEmail: async (
      _: unknown,
      { senderEmail, email, logo, hotelName }: { senderEmail: string,email: string; logo: string, hotelName: string },
      context: any
    ): Promise<boolean> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }

      try {
        await transporter.sendMail({
          from: senderEmail,
          to: email,
          subject: 'E-mail de remerciement',
          html: `<div><p>Cher.e client.e,</p><p>Vous accueillir au sein de notre établissement fut un immense plaisir et nous tenions encore à vous remercier pour la confiance que vous nous avez accordé.</p><p>Nous espérons que nos efforts ont contribué à rendre votre séjour agréable.</p><p>Nous vous souhaitons un bon retour avec l'espoir de vous revoir très bientôt.</p><p>Cordialement</p><div><br/><br/><img src=${logo} width='100' height="100" /><p>${hotelName}</p></div></div>`,
        });
        return true;
      } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
      }
    },

    sendNewCoworkerAccountEmail: async (
      _: unknown,
      { senderEmail, email, adminName, mshLogo, coworkerName, coworkerMail }: { senderEmail: string,email: string; adminName: string; mshLogo: string, coworkerName: string; coworkerMail: string },
      context: any
    ): Promise<boolean> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }

      try {
        await transporter.sendMail({
          from: senderEmail,
          to: email,
          subject: 'Votre compte MySweetHotel a été créé avec succès !',
          html: `<div><img src="https://i.postimg.cc/h40kFMNY/new-logo-msh.png" width="300" height="300" /><h4><b>${adminName}</b> vous a créé un compte <b>MySweetHotelPro</b>.</h4><h4>Bienvenu.e à bord, ${coworkerName} !</h4><br/><p>Vous pouvez désormais accéder au <b>Desk digital</b> de votre hôtel en suivant ce lien : <a href='https://mysweethotelpro.com' target="_blank">https://mysweethotelpro.com</a></p><p>Vous y trouverez un cahier de consigne, un C.R.M, un registre d'objets trouvés, des feuilles de caisses, des check-lists... bref, tout le nécessaire pour effectuer un <i>shift</i> dans les meilleures conditions.</p><p>Vos identifiants d'accès sont les suivants:<br/> <br/> <b>E-mail</b> : ${coworkerMail}<br/>  <b>Mot de passe</b> : password<br/> <br/> Vous serez libre de modifier vos identifiants en vous rendant dans la section <b>Profil</b> du <b>Desk digital</b>.</p><p>En cas de problème, vous disposez d'un <i>chat</i> dédié au support technique sur l'interface du <b>Desk digital</b>.</p><p>Enfin, nous vous enjoignons vivement à nous faire part de vos avis et suggestions concernant le produit en nous laissant un mot dans la Feedback Box située dans la barre de navigation du <b>Desk digital</b>.</p><p>Toute l'équipe de <b>MySweetHotel</b> vous souhaite encore la bienvenue à bord.</p><br/><p>David Simba<br/> CEO de MySweetHotel</p>  <p><img src=${mshLogo} width='100' height='100' /></p>  </div>`,
        });
        return true;
      } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
      }
    },

    sendNewSubscriberEmail: async (
      _: unknown,
      { senderEmail, email, hotel, standing, capacity, city, country, subscriber }: { senderEmail: string,email: string; hotel: string; standing: string, capacity: string; city: string; country: string; subscriber: string },
      context: any
    ): Promise<boolean> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }

      try {
        await transporter.sendMail({
          from: senderEmail,
          to: email,
          subject: 'Another One',
          html: `<div><p>Nom de l'hotel: ${hotel}</p><p>Standing: ${standing}</p><p>Capacité: ${capacity} pax</p><p>Ville: ${city}</p><p>Pays: ${country}</p><p>Nom du responsable: ${subscriber}</p></div>`,
        });
        return true;
      } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
      }
    },

    sendWelcomeEmail: async (
      _: unknown,
      { senderEmail, email, prospectName, prospectMail, mshLogo, mshLogoPro }: { senderEmail: string,email: string; prospectName: string; prospectMail: string, mshLogo: string; mshLogoPro: string },
      context: any
    ): Promise<boolean> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }

      try {
        await transporter.sendMail({
          from: senderEmail,
          to: email,
          subject: "Votre compte MySweetHotel a été créé avec succès !",
          html: `<div> <p>Bonjour ${prospectName},</p><br/> <p>Comme convenu, nous vous avons créé un compte <b>MySweetHotelPro</b> afin que vous puissiez démarrer dès maintenant la phase de pilotage qui s'étendra sur une durée de 3 mois.<br/> Nous vous rappelons que cette phase de pilotage est entièrement gratuite et sans engagement.</p> <p>Vous pourrez ainsi profiter pleinement de notre solution digitale à 360° comprenant:<br/><br/> La <b>Conciergerie digitale</b> conçue pour améliorer l'expérience client<br/> Le <b>Desk digital</b> conçu pour optimiser la productivité des équipes<br/><br/> Pour un rappel du contenu de nos offres, nous vous invitons à vous rendre sur notre site web <a href="https://mysweethotel.com" target="_blank">https://mysweethotel.com</a>.</p> <p>Votre compte administrateur étant actif, vous pouvez désormais accéder au <b>Desk digital</b> en suivant ce lien: <a href="https://mysweethotelpro.com" target="_blank">https://mysweethotelpro.com</a><br/> Vos identifiants d'accès sont les suivants:<br/><br/> <b>E-mail</b> : ${prospectMail}<br/> <b>Mot de passe</b> : password<br/><br/> Vous serez libre de modifier vos identifiants en vous rendant dans la section <b>Profil</b> du <b>Desk digital</b>.</p> <p>Au sein de cette même section <b>Profil</b> (et uniquement depuis un ordinateur), vous pourrez téléverser le logo de votre établissement afin qu'il soit mis en avant sur toutes nos plateformes.<br/> Vous pourrez également générer les visuels de communication à travers lesquels votre clientèle pourra accéder à la <b>Conciergerie digitale</b> en scannant simplement le qr code figurant sur ces derniers.</p> <p>Enfin, il vous suffira de vous rendre dans la section administration du <b>Desk digital</b> pour y créer les comptes de vos collaborateurs. <br/> Pour ce faire, vous n'aurez besoin que de leurs noms et de leurs adresses e-mail (<i>password</i> étant le mot de passe générique attribué automatiquement lors de chaque création de compte).</p> <p>Toute l'équipe de <b>MySweetHotel</b> vous souhaite la bienvenue et vous remercie pour votre confiance.</p><br/><br/> <p>David Simba<br/> CEO de MySweetHotel<br/> +33 7 52 04 72 99</p> <p><img src=${mshLogo} width='100' height='100' /><img src=${mshLogoPro} width='100' height='100' /></p> </div>`,
        });
        return true;
      } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
      }
    },

    sendWelcomeFinalEmail: async (
      _: unknown,
      { senderEmail, email, mshBanner, firstName, mshLogo, password, fakeMail, appLink }: { senderEmail: string,email: string; mshBanner: string; firstName: string, mshLogo: string; password: string; fakeMail: string; appLink: string },
      context: any
    ): Promise<boolean> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }

      try {
        await transporter.sendMail({
          from: senderEmail,
          to: email,
          subject: "Félicitations, vous venez d'économiser du temps et de l'argent !",
          html: `<div> <img src=${mshBanner} width="300" height="300" /> <p>Merci de vous être inscrit.e sur notre plate-forme et bienvenue à bord, ${firstName} !</p> <p>Vous trouverez ci-dessous les codes d'accès ainsi que le lien qui vous permettront de vous<br/> connecter au <i>Desk Digital</i> :</p> <p> <b>e-mail :</b> ${email}<br/> <b>mot de passe :</b> ${password}<br/> <b>lien : </b><a href='https://mysweethotelpro.com/'>Lien vers le <i>Desk digital</i></a> </p> <p>Vous trouverez également une adresse e-mail avec laquelle vous pourrez effectuez le parcours<br/> client à travers la <i>Conciergerie digitale</i> ainsi qu'un lien donnant accès à la plate-forme : </p> <p> <b>e-mail :</b> ${fakeMail}<br/> <b>lien :</b> <a href="${appLink}" target="_blank"><i>Lien vers la Conciergerie Digitale</i></a> </p> <p>Merci encore pour votre confiance et n'hésitez surtout pas à nous<br/> faire part de vos suggestions concernant le produit.</p><br/> <p>Cordialement</p><br/> <div> <p>David SIMBA <br/>CEO de My Sweet Hotel<br/>07 52 04 72 99<br/><img src=${mshLogo} width='100' height='100' /></p> </div> </div>`,
        });
        return true;
      } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
      }
    },

    sendWelcomeEmailLogo: async (
      _: unknown,
      { senderEmail, email, firstName, logo, mshLogo, password, fakeMail, appLink }: { senderEmail: string; email: string; firstName: string; logo?: string; mshLogo: string; password: string; fakeMail: string; appLink: string },
      context: any
    ): Promise<boolean> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }

      try {
        await transporter.sendMail({
          from: senderEmail,
          to: email,
          subject: "Félicitations, vous venez de prendre 2 ans d'avance sur la concurrence !",
          html: logo ? `<div> <p>Merci de vous être inscrit.e sur notre plate-forme et bienvenue à bord, ${firstName} !</p> <p>Peut-être est-ce la première fois que vous utilisez ce genre d'outils, auquel cas nous vous accompagnerons lors de vos premiers pas dans le monde de l'hôtellerie digitale.</p> <p>D'après mes informations, j'ai pu constater que vous aviez créé un compte administrateur et téléversé le logo de votre établissement afin que votre clientèle puisse associer les bienfaits apportés par notre solution à votre image de marque et ce, dans un souci de fidélisation.</p> <p>Vous trouverez ci-dessous les codes d'accès ainsi que le lien qui vous permettront de vous connecter au <i>Desk Digital</i></p> <p> <b>e-mail :</b> ${email}<br/> <b>mot de passe :</b> ${password}<br/> <b>lien :</b><a href='https://mysweethotelpro.com/'>Lien vers le <i>Desk digital</i></a> </p> <p>Concernant la <i>Conciergerie digitale</i>, il ne vous sera pas possible d'utiliser la même adresse e-mail que celle utilisée lors de votre première inscription et ce, pour des raisons de sécurité.</p> <p>Vous trouverez ci-dessous une adresse e-mail avec laquelle vous pourrez effectuez le parcours client propre à la <i>Conciergerie digitale</i> (depuis la page d'inscription jusqu'à la page d'accueil) si vous le souhaitez:</p> <p> <b>e-mail :</b> ${fakeMail}<br/> </p> <p>Voici le lien vous donnant accès à la <i>Conciergerie digitale</i>:</p> <p><a href="${appLink}" target="_blank"><b>Lien vers la Conciergerie Digitale</b></a></p> <p>Votre clientèle pourra également accéder à la <i>Conciergerie digitale</i> en scannant le qr code présent sur les visuels de communication téléchargeables depuis la section <i>Profil utilisateur</i> du <i>Desk digital</i>.</p> <p>Si vous rencontrez la moindre difficulté en utilisant notre solution, nous avons mis à votre disposition un <i>chat</i> consacré au support technique accessible depuis le <i>Desk digital</i> et opérationnel 24h/7.</p> <p>Nous sommes heureux de mettre notre solution à disposition des hôteliers (gratuitement et sans engagement) et ce, dans le cadre de notre phase de pré-lancement qui a démarré avec la nouvelle année pour s'étendre sur une durée de 3 à 6 mois.</p> <p>Merci encore d'avoir pris le temps de vous inscrire sur notre plate-forme et n'hésitez surtout pas à nous faire part de vos suggestions concernant le produit.</p><br/> <p>Cordialement</p><br/> <div> <p>David SIMBA <br/>CEO de My Sweet Hotel<br/>07 52 04 72 99<br/><img src=${mshLogo} width='100' height='100' /></p> </div> </div>` : `<div> <p>Merci de vous être inscrit.e sur notre plate-forme et bienvenue à bord, {{firstName}} !</p> <p>Peut-être est-ce la première fois que vous utilisez ce genre d'outils, auquel cas nous vous accompagnerons lors de vos premiers pas dans le monde de l'hôtellerie digitale.</p> <p>D'après mes informations, j'ai pu constater que vous aviez créé un compte administrateur mais que vous n'avez pas encore téléversé de logo pour votre hôtel...</p> <p>Notre solution étant une solution en marque blanche, il est important que vous téléversiez le logo de votre établissement afin que votre clientèle puisse associer les bienfaits apportés par notre solution à votre image de marque et ce, dans un souci de fidélisation.</p> <p>Vous trouverez ci-dessous les codes d'accès ainsi que le lien qui vous permettront de vous connecter au <i>Desk Digital</i></p> <p> <b>e-mail :</b> {{email}}<br/> <b>mot de passe :</b> {{password}}<br/> <b>lien :</b><a href='https://mysweethotelpro.com/'>Lien vers le <i>Desk digital</i></a> </p> <p>Concernant la <i>Conciergerie digitale</i>, il ne vous sera pas possible d'utiliser la même adresse e-mail que celle utilisée lors de votre première inscription et ce, pour des raisons de sécurité.</p> <p>Vous trouverez ci-dessous une adresse e-mail avec laquelle vous pourrez effectuez le parcours client propre à la <i>Conciergerie digitale</i> (depuis la page d'inscription jusqu'à la page d'accueil) si vous le souhaitez:</p> <p> <b>e-mail :</b> {{fakeMail}} </p> <p>Voici le lien vous donnant accès à la <i>Conciergerie digitale</i>:</p> <p><a href="{{appLink}}" target="_blank"><b>Lien vers la Conciergerie Digitale</b></a></p> <p>Votre clientèle pourra également accéder à la <i>Conciergerie digitale</i> en scannant le qr code présent sur les visuels de communication lorsque vous aurez téléversé le logo de votre établissement depuis la section <i>Profil utilisateur</i> du <i>Desk digital</i>.</p> <p>Si vous rencontrez la moindre difficulté en utilisant notre solution, nous avons mis à votre disposition un <i>chat</i> consacré au support technique accessible depuis le <i>Desk digital</i> et opérationnel 24h/7.</p> <p>Nous sommes heureux de mettre notre solution à disposition des hôteliers (gratuitement et sans engagement) et ce, dans le cadre de notre phase de pré-lancement qui a démarré avec la nouvelle année pour s'étendre sur une durée de 3 à 6 mois.</p> <p>Merci encore d'avoir pris le temps de vous inscrire sur notre plate-forme et n'hésitez surtout pas à nous faire part de vos suggestions concernant le produit.</p><br/> <p>Cordialement</p><br/> <div> <p>David SIMBA <br/>CEO de My Sweet Hotel<br/>07 52 04 72 99<br/><img src={{mshLogo}} width='100' height='100' /></p> </div> </div>`,
        });
        return true;
      } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
      }
    }, 
    
    subscribeToPush: async (_: unknown, { userId, subscription }: any, context: any) : Promise<boolean> => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }

      try {
        await GuestUser.findByIdAndUpdate(
          userId,
          { token: subscription },
          { new: true }
        );
  
        console.log('Subscription enregistrée :', subscription);
        return true;
      } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        throw new Error('Failed to subscribe to push notifications');
        
      }
    },

    sendPushNotification: async (_: unknown, { subscription, data }: any, context: any) : Promise<boolean> => {
      if (!context.user) {
          throw new Error('Unauthorized');
      }
      try {
          const icon = data.logo
          const language = data.language
          const title = data.hotelName
          const hotelId = data.hotelId
          const guestStatus = data.isChatting

          let body

          switch (language) {
          case 'fr':
              body = "Vous avez un nouveau message !"
          break;
          case 'en':
              body = "You have a new message !"
          break;
          case 'de':
              body = "Du hast eine neue Nachricht !"
          break;
          case 'it':
              body = "Hai un nuovo messaggio!"
          break;
          case 'pt':
              body = "Você tem uma nova mensagem !"
          break;
          case 'es':
              body = "Tienes un nuevo mensaje !"
          break;
          default:
          break;
          }
      
          const message = {
              title: title,
              body: body,
              icon: icon,
              hotelId: hotelId,
              guestStatus: guestStatus
          };

          const payload = JSON.stringify(message);    

          await webpush.sendNotification(subscription, JSON.stringify(payload));
          console.log('Notification envoyée !');
          return true;
      } catch (err) {
          console.error('Erreur Web Push:', err);
          return false;
      }
    }
  }
};