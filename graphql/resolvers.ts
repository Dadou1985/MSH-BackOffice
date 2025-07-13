import Hotel from '../models/hotels/hotels.js';
import BusinessUser from '../models/businessUsers.js';
import GuestUser from '../models/guest/guestUsers.js';
import Support from '../models/support.js';
import Feedbacks from '../models/feedbacks.js';
import { getAllBusinessUsers } from '../controllers/users/business/businessUsers.controller.js';
import { io } from '../app.js';

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
} from '../type/type.ts';

export const resolvers = {
  Query: {
    /*
      Récupère tous les hôtels
      @returns {Promise<Hotel[]>} Liste des hôtels
    */
    getHotels: async () => await Hotel.find(),
    getHotelById: async (_: any, { id }: any) => await Hotel.findById(id),
    getFeedbacks: async () => await Feedbacks.find(),
    getFeedbackById: async (_: any, { id }: any) => await Feedbacks.findOne({hotelId: id}),
    getSupports: async () => await Support.find(),
    getSupportById: async (_: any, { id }: any) => await Support.findOne({hotelId: id}),
    getBusinessUsers: async () => await BusinessUser.find(),
    getBusinessUserById: async (_: any, { id }: any) => await BusinessUser.findOne({userId: id}),

    // Combined user queries
    getGuestUsers: async () => {
      const guestUsers = await GuestUser.find();
      return guestUsers
    },
    getGuestUserById: async (_: any, { id }: any) => {
      const guestUser = await GuestUser.findOne({userId: id});
      return guestUser;
    },
  },

  Mutation: {
    createHotel: async (_: unknown, { input }: { input: HotelType }): Promise<HotelType> => {
      const newHotel = new Hotel(input);
      return await newHotel.save();
    },
    updateHotel: async (_: unknown, { id, input }: { id: string, input: Partial<HotelType> }): Promise<HotelType | null> => {
      return await Hotel.findByIdAndUpdate(id, input, { new: true });
    },

    deleteHotel: async (_: unknown, { id }: { id: string }): Promise<string> => {
      const result = await Hotel.findByIdAndDelete(id);
      return "Hotel deleted";
    },
    // New mutations for updating specific hotel fields
    addHotelFieldItem: async (
      _: unknown,
      { hotelId, field, item }: { hotelId: string; field: string; item: HotelFieldItem }
    ): Promise<HotelType> => {
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
      { hotelId, field, itemId }: { hotelId: string; field: string; itemId: string }
    ): Promise<HotelType> => {
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
      { hotelId, field, itemId, updates }: { hotelId: string; field: string; itemId: string; updates: Partial<HotelFieldItem> }
    ): Promise<HotelFieldItem> => {
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
      { hotelId, checklist }: { hotelId: string; checklist: Record<string, ChecklistItem[]> }
    ): Promise<Record<string, ChecklistItem[]>> => {
        const hotel: any = await Hotel.findById(hotelId);
        if (!hotel) throw new Error("Hotel not found");

        hotel.checklist = checklist;
        await hotel.save();
        io.to(hotelId).emit(`checklistUpdated`, hotel.checklist);
        return hotel.checklist;
    },
    addChecklistItem: async (
      _: unknown,
      { hotelId, period, item }: { hotelId: string; period: string; item: ChecklistItem }
    ): Promise<ChecklistItem> => {
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
      { hotelId, period, itemId, updates }: { hotelId: string; period: string; itemId: string; updates: Partial<ChecklistItem> }
    ): Promise<ChecklistItem> => {
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
      { hotelId, period, itemId }: { hotelId: string; period: string; itemId: string }
    ): Promise<string> => {
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
      { hotelId, userId }: { hotelId: string; userId: string }
    ): Promise<HotelType> => {
      const hotel: any = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      hotel.chat = hotel.chat.filter((c: { userId: string; }) => c.userId !== userId);
      await hotel.save();
      io.to(hotelId).emit(`chatRemoved`, userId);
      return hotel;
    },

    addMessageToChatRoom: async (
      _: unknown,
      { hotelId, userId, message }: { hotelId: string; userId: string; message: ChatRoomMessage }
    ): Promise<any> => { // TODO: Replace 'any' with proper Chat type if available
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
      { hotelId, userId, messageId, updates }: { hotelId: string; userId: string; messageId: string; updates: Partial<ChatRoomMessage> }
    ): Promise<ChatRoomMessage> => {
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
      { hotelId, userId, messageId }: { hotelId: string; userId: string; messageId: string }
    ): Promise<any> => { // TODO: Replace 'any' with proper Chat type if available
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
      { hotelId, chat }: { hotelId: string; chat: any } // TODO: Define Chat type in types.ts
    ): Promise<HotelType> => {
      const hotel: any = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      hotel.chat.push(chat);
      await hotel.save();
      io.to(hotelId).emit(`chatAdded`, chat);
      return hotel;
    },

    updateChatFromHotel: async (
      _: unknown,
      { hotelId, userId, updates }: { hotelId: string; userId: string; updates: Partial<any> } // TODO: Replace 'any' with Chat type
    ): Promise<any> => { // TODO: Replace 'any' with Chat type
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
      { hotelId, category, item }: { hotelId: string; category: string; item: HousekeepingItem }
    ): Promise<HousekeepingItem[]> => {
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
      { hotelId, category, itemId, updates }: { hotelId: string; category: string; itemId: string; updates: Partial<HousekeepingItem> }
    ): Promise<HousekeepingItem> => {
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
      { hotelId, category, itemId }: { hotelId: string; category: string; itemId: string }
    ): Promise<HousekeepingItem[]> => {
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
      { input }: { input: FeedbackType }
    ): Promise<FeedbackType> => {
      const newFeedback = new Feedbacks(input);
      const savedFeedback = await newFeedback.save();
      io.to(savedFeedback.hotelId).emit(`feedbackCreated`, savedFeedback);
      return savedFeedback;
    },
    updateFeedback: async (
      _: unknown,
      { id, input }: { id: string; input: Partial<FeedbackType> }
    ): Promise<FeedbackType | null> => {
      const updatedFeedback = await Feedbacks.findByIdAndUpdate(id, input, { new: true });
      if (updatedFeedback) {
        io.to(updatedFeedback.hotelId).emit(`feedbackUpdated`, updatedFeedback);
      }
      return updatedFeedback;
    },
    deleteFeedback: async (
      _: unknown,
      { id }: { id: string }
    ): Promise<boolean> => {
      const feedback: any = await Feedbacks.findById(id);
      if (!feedback) throw new Error("Feedback not found");
      await Feedbacks.findByIdAndDelete(id);
      io.to(feedback.hotelId).emit(`feedbackDeleted`, id);
      return true;
    },

    // Feedback Category mutations (generic for satisfaction & improvement)
    addFeedbackCategoryItem: async (
      _: unknown,
      { feedbackId, field, category }: { feedbackId: string; field: string; category: FeedbackCategory }
    ): Promise<FeedbackType> => {
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
      { feedbackId, field, itemId, updates }: { feedbackId: string; field: string; itemId: string; updates: Partial<FeedbackCategory> }
    ): Promise<FeedbackCategory> => {
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
      { feedbackId, field, itemId }: { feedbackId: string; field: string; itemId: string }
    ): Promise<FeedbackType> => {
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
      { input }: { input: GuestUserType }
    ): Promise<GuestUserType> => {
      const newGuestUser = new GuestUser(input);
      return await newGuestUser.save();
    },
    updateGuestUser: async (
      _: unknown,
      { id, input }: { id: string; input: Partial<GuestUserType> }
    ): Promise<GuestUserType | null> => {
      return await GuestUser.findByIdAndUpdate(id, input, { new: true });
    },
    deleteGuestUser: async (
      _: unknown,
      { id }: { id: string }
    ): Promise<boolean> => {
      await GuestUser.findByIdAndDelete(id);
      return true;
    },

    // BusinessUser mutations
    createBusinessUser: async (
      _: unknown,
      { input }: { input: BusinessUserType }
    ): Promise<BusinessUserType> => {
      const newBusinessUser = new BusinessUser(input);
      return await newBusinessUser.save();
    },
    updateBusinessUser: async (
      _: unknown,
      { id, input }: { id: string; input: Partial<BusinessUserType> }
    ): Promise<BusinessUserType | null> => {
      return await BusinessUser.findByIdAndUpdate(id, input, { new: true });
    },
    deleteBusinessUser: async (
      _: unknown,
      { id }: { id: string }
    ): Promise<boolean> => {
      await BusinessUser.findByIdAndDelete(id);
      return true;
    },

    // Support-specific mutations
    createSupport: async (
      _: unknown,
      { input }: { input: SupportType }
    ): Promise<SupportType> => {
      const newSupport = new Support(input);
      const savedSupport = await newSupport.save();
      io.to(savedSupport.hotelId).emit(`supportCreated`, savedSupport);
      return savedSupport;
    },
    updateSupport: async (
      _: unknown,
      { id, updates }: { id: string; updates: Partial<SupportType> }
    ): Promise<SupportType | null> => {
      const updatedSupport = await Support.findByIdAndUpdate(id, updates, { new: true });
      if (updatedSupport) {
        io.to(updatedSupport.hotelId).emit(`supportUpdated`, updatedSupport);
      }
      return updatedSupport;
    },
    deleteSupport: async (
      _: unknown,
      { id }: { id: string }
    ): Promise<boolean> => {
      const support = await Support.findById(id);
      if (!support) throw new Error("Support not found");
      await Support.findByIdAndDelete(id);
      io.to(support.hotelId).emit(`supportDeleted`, id);
      return true;
    },
    addMessageToSupportChatRoom: async (
      _: unknown,
      { supportId, message }: { supportId: string; message: any } // TODO: Define SupportChatRoomMessage type in types.ts
    ): Promise<SupportType> => {
      const support = await Support.findOne({hotelId: supportId});
      if (!support) throw new Error("Support not found");

      support.chatRoom.push(message);
      await support.save();
      io.to(supportId).emit(`supportChatRoomMessageAdded`, message);
      return support;
    },
    updateSupportChatRoomMessage: async (
      _: unknown,
      { supportId, messageId, updates }: { supportId: string; messageId: string; updates: Partial<any> } // TODO: Define SupportChatRoomMessage type
    ): Promise<any> => { // TODO: Replace 'any' with SupportChatRoomMessage type
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
      { supportId, messageId }: { supportId: string; messageId: string }
    ): Promise<SupportType> => {
      const support = await Support.findOne({hotelId: supportId});
      if (!support) throw new Error("Support not found");

      const message = support.chatRoom.id(messageId);
      if (!message) throw new Error("Message not found");

      message.deleteOne();
      await support.save();
      io.to(supportId).emit(`supportChatRoomMessageDeleted`, messageId);
      return support;
    },
  },
};