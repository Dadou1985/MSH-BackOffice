import Hotel from '../models/hotels/hotels.js';
import BusinessUser from '../models/businessUsers.js';
import GuestUser from '../models/guest/guestUsers.js';
import Support from '../models/support.js';
import Feedbacks from '../models/feedbacks.js';
import { io } from '../app.js';
import { generateToken } from '../utils/jwt.js';
import redisClient from '../utils/redisClient.js';
export const resolvers = {
    Query: {
        /*
          Récupère tous les hôtels
          @returns {Promise<Hotel[]>} Liste des hôtels
        */
        getHotels: async (_, __, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            return await Hotel.find();
        },
        getHotelById: async (_, { id }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            return await Hotel.findById(id);
        },
        getFeedbacks: async (_, __, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            return await Feedbacks.find();
        },
        getFeedbackById: async (_, { id }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            return await Feedbacks.findOne({ hotelId: id });
        },
        getSupports: async (_, __, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            return await Support.find();
        },
        getSupportById: async (_, { id }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            return await Support.findOne({ hotelId: id });
        },
        getBusinessUsers: async (_, __, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            return await BusinessUser.find();
        },
        getBusinessUserById: async (_, { id }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            return await BusinessUser.findOne({ userId: id });
        },
        // Combined user queries
        getGuestUsers: async (_, __, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const guestUsers = await GuestUser.find();
            return guestUsers;
        },
        getGuestUserById: async (_, { id }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const guestUser = await GuestUser.findOne({ userId: id });
            return guestUser;
        },
    },
    Mutation: {
        loginUser: async (_, { email, password, userCategory }) => {
            const user = userCategory === 'business' ? await BusinessUser.findOne({ email }) : await GuestUser.findOne({ email });
            if (!user)
                throw new Error("User not found");
            // Remplace ceci par ton vrai mécanisme de mot de passe
            if (user.password !== password)
                throw new Error("Invalid credentials");
            const jwtoken = generateToken({ userId: user.id });
            return { jwtoken };
        },
        logout: async (_, __, context) => {
            const authHeader = context.req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new Error('Authorization header missing');
            }
            const token = authHeader.split(' ')[1];
            // Optionnel : obtenir l'expiration exacte du JWT si tu veux l’adapter dynamiquement
            const expirySeconds = 60 * 60; // Exemple : 1h
            try {
                await redisClient.set(`blacklist:${token}`, '1', { EX: expirySeconds });
                return true;
            }
            catch (err) {
                console.error('Redis error:', err);
                throw new Error('Logout failed');
            }
        },
        createHotel: async (_, { input }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const newHotel = new Hotel(input);
            return await newHotel.save();
        },
        updateHotel: async (_, { id, input }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            return await Hotel.findByIdAndUpdate(id, input, { new: true });
        },
        deleteHotel: async (_, { id }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const result = await Hotel.findByIdAndDelete(id);
            return "Hotel deleted";
        },
        // New mutations for updating specific hotel fields
        addHotelFieldItem: async (_, { hotelId, field, item }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const allowedFields = ['cab', 'note', 'sticker', 'clock', 'safe', 'roomChange', 'maintenance', 'lostAndFound', 'chat'];
            if (!allowedFields.includes(field)) {
                throw new Error(`${field} is not allowed or is not a list field`);
            }
            const hotel = await Hotel.findById(hotelId);
            if (!hotel)
                throw new Error("Hotel not found");
            if (!Array.isArray(hotel[field])) {
                throw new Error(`${field} is not an array`);
            }
            hotel[field].push(item);
            await hotel.save();
            io.to(hotelId).emit(`${field}Added`, item);
            return hotel;
        },
        removeHotelFieldItem: async (_, { hotelId, field, itemId }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const allowedFields = ['cab', 'note', 'sticker', 'clock', 'safe', 'roomChange', 'maintenance', 'lostAndFound', 'chat'];
            if (!allowedFields.includes(field)) {
                throw new Error(`${field} is not allowed or is not a list field`);
            }
            const hotel = await Hotel.findById(hotelId);
            if (!hotel)
                throw new Error("Hotel not found");
            if (!Array.isArray(hotel[field])) {
                throw new Error(`${field} is not an array`);
            }
            const item = hotel[field].find((item) => item.id === itemId);
            if (!item) {
                throw new Error(`Item with ID ${itemId} not found in ${field}`);
            }
            item.deleteOne();
            await hotel.save();
            io.to(hotelId).emit(`${field}Removed`, itemId);
            return hotel;
        },
        updateHotelFieldItem: async (_, { hotelId, field, itemId, updates }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const allowedFields = ['cab', 'note', 'sticker', 'clock', 'safe', 'roomChange', 'maintenance', 'lostAndFound', 'chat'];
            if (!allowedFields.includes(field)) {
                throw new Error(`${field} is not allowed or is not a list field`);
            }
            const hotel = await Hotel.findById(hotelId);
            if (!hotel)
                throw new Error("Hotel not found");
            if (!Array.isArray(hotel[field])) {
                throw new Error(`${field} is not an array`);
            }
            const item = hotel[field].find((item) => item.id === itemId);
            if (!item) {
                throw new Error(`Item with ID ${itemId} not found in ${field}`);
            }
            Object.assign(item, updates);
            await hotel.save();
            io.to(hotelId).emit(`${field}Updated`, item);
            return item;
        },
        createChecklist: async (_, { hotelId, checklist }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const hotel = await Hotel.findById(hotelId);
            if (!hotel)
                throw new Error("Hotel not found");
            hotel.checklist = checklist;
            await hotel.save();
            io.to(hotelId).emit(`checklistUpdated`, hotel.checklist);
            return hotel.checklist;
        },
        addChecklistItem: async (_, { hotelId, period, item }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const hotel = await Hotel.findById(hotelId);
            if (!hotel)
                throw new Error("Hotel not found");
            if (!hotel.checklist[period])
                hotel.checklist[period] = [];
            hotel.checklist[period].push(item);
            await hotel.save();
            io.to(hotelId).emit(`checklistItemAdded`, { period, item });
            return item;
        },
        updateChecklistItem: async (_, { hotelId, period, itemId, updates }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const hotel = await Hotel.findById(hotelId);
            if (!hotel)
                throw new Error("Hotel not found");
            const item = hotel.checklist[period]?.id(itemId);
            if (!item)
                throw new Error("Checklist item not found");
            Object.assign(item, updates);
            await hotel.save();
            io.to(hotelId).emit(`checklistItemUpdated`, { period, item });
            return item;
        },
        deleteChecklistItem: async (_, { hotelId, period, itemId }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const hotel = await Hotel.findById(hotelId);
            if (!hotel)
                throw new Error("Hotel not found");
            hotel.checklist[period].pull(itemId);
            await hotel.save();
            io.to(hotelId).emit(`checklistItemDeleted`, { period, itemId });
            return "Item deleted";
        },
        // Chat-specific mutations
        removeChatFromHotel: async (_, { hotelId, userId }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const hotel = await Hotel.findById(hotelId);
            if (!hotel)
                throw new Error("Hotel not found");
            hotel.chat = hotel.chat.filter((c) => c.userId !== userId);
            await hotel.save();
            io.to(hotelId).emit(`chatRemoved`, userId);
            return hotel;
        },
        addMessageToChatRoom: async (_, { hotelId, userId, message }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const hotel = await Hotel.findById(hotelId);
            if (!hotel)
                throw new Error("Hotel not found");
            const chatEntry = hotel.chat.find((c) => c.userId === userId);
            if (!chatEntry)
                throw new Error("Chat not found for user");
            chatEntry.chatRoom.push(message);
            await hotel.save();
            io.to(hotelId).emit(`chatRoomMessageAdded`, { userId, message });
            return chatEntry;
        },
        updateChatRoomMessage: async (_, { hotelId, userId, messageId, updates }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const hotel = await Hotel.findById(hotelId);
            if (!hotel)
                throw new Error("Hotel not found");
            const chatEntry = hotel.chat.find((c) => c.userId === userId);
            if (!chatEntry)
                throw new Error("Chat not found for user");
            const message = chatEntry.chatRoom.id(messageId);
            if (!message)
                throw new Error("Message not found");
            Object.assign(message, updates);
            await hotel.save();
            io.to(hotelId).emit(`chatRoomMessageUpdated`, { userId, message });
            return message;
        },
        deleteChatRoomMessage: async (_, { hotelId, userId, messageId }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const hotel = await Hotel.findById(hotelId);
            if (!hotel)
                throw new Error("Hotel not found");
            const chatEntry = hotel.chat.find((c) => c.userId === userId);
            if (!chatEntry)
                throw new Error("Chat not found for user");
            const message = chatEntry.chatRoom.id(messageId);
            if (!message)
                throw new Error("Message not found");
            message.deleteOne();
            await hotel.save();
            io.to(hotelId).emit(`chatRoomMessageDeleted`, { userId, messageId });
            return chatEntry;
        },
        addChatToHotel: async (_, { hotelId, chat }, // TODO: Define Chat type in types.ts
        context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const hotel = await Hotel.findById(hotelId);
            if (!hotel)
                throw new Error("Hotel not found");
            hotel.chat.push(chat);
            await hotel.save();
            io.to(hotelId).emit(`chatAdded`, chat);
            return hotel;
        },
        updateChatFromHotel: async (_, { hotelId, userId, updates }, // TODO: Replace 'any' with Chat type
        context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const hotel = await Hotel.findById(hotelId);
            if (!hotel)
                throw new Error("Hotel not found");
            const chatEntry = hotel.chat.find((c) => c.userId === userId);
            if (!chatEntry)
                throw new Error("Chat not found");
            Object.assign(chatEntry, updates);
            await hotel.save();
            io.to(hotelId).emit(`chatUpdated`, { userId, updates });
            return chatEntry;
        },
        // Housekeeping-specific mutations
        addHousekeepingItem: async (_, { hotelId, category, item }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const hotel = await Hotel.findById(hotelId);
            if (!hotel)
                throw new Error("Hotel not found");
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
        updateHousekeepingItem: async (_, { hotelId, category, itemId, updates }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const hotel = await Hotel.findById(hotelId);
            if (!hotel)
                throw new Error("Hotel not found");
            const housekeepingCategories = ['towel', "pillow", "blanket", "soap", "babyBed", "iron", "toiletPaper", "hairDryer"];
            if (!housekeepingCategories.includes(category)) {
                throw new Error(`${category} is not a valid housekeeping category`);
            }
            const item = hotel.housekeeping[category]?.id(itemId);
            if (!item)
                throw new Error("Housekeeping item not found");
            Object.assign(item, updates);
            await hotel.save();
            io.to(hotelId).emit(`housekeepingItemUpdated`, { category, item });
            return item;
        },
        removeHousekeepingItem: async (_, { hotelId, category, itemId }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const hotel = await Hotel.findById(hotelId);
            if (!hotel)
                throw new Error("Hotel not found");
            const housekeepingCategories = ['towel', "pillow", "blanket", "soap", "babyBed", "iron", "toiletPaper", "hairDryer"];
            if (!housekeepingCategories.includes(category)) {
                throw new Error(`${category} is not a valid housekeeping category`);
            }
            if (!Array.isArray(hotel.housekeeping[category])) {
                throw new Error(`${category} is not a valid housekeeping category`);
            }
            const item = hotel.housekeeping[category].find((item) => item.id === itemId);
            if (!item)
                throw new Error("Item not found");
            item.deleteOne();
            await hotel.save();
            io.to(hotelId).emit(`housekeepingItemRemoved`, { category, itemId });
            return hotel.housekeeping[category];
        },
        // Feedback mutations
        createFeedback: async (_, { input }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const newFeedback = new Feedbacks(input);
            const savedFeedback = await newFeedback.save();
            io.to(savedFeedback.hotelId).emit(`feedbackCreated`, savedFeedback);
            return savedFeedback;
        },
        updateFeedback: async (_, { id, input }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const updatedFeedback = await Feedbacks.findByIdAndUpdate(id, input, { new: true });
            if (updatedFeedback) {
                io.to(updatedFeedback.hotelId).emit(`feedbackUpdated`, updatedFeedback);
            }
            return updatedFeedback;
        },
        deleteFeedback: async (_, { id }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const feedback = await Feedbacks.findById(id);
            if (!feedback)
                throw new Error("Feedback not found");
            await Feedbacks.findByIdAndDelete(id);
            io.to(feedback.hotelId).emit(`feedbackDeleted`, id);
            return true;
        },
        // Feedback Category mutations (generic for satisfaction & improvement)
        addFeedbackCategoryItem: async (_, { feedbackId, field, category }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const allowedFields = ['satisfaction', 'improvement'];
            if (!allowedFields.includes(field)) {
                throw new Error(`${field} is not a valid category field`);
            }
            const feedback = await Feedbacks.findOne({ hotelId: feedbackId });
            if (!feedback)
                throw new Error("Feedback not found");
            feedback[field].push(category);
            await feedback.save();
            io.to(feedback.hotelId).emit(`feedbackCategoryItemAdded`, { field, category });
            return feedback;
        },
        updateFeedbackCategoryItem: async (_, { feedbackId, field, itemId, updates }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const allowedFields = ['satisfaction', 'improvement'];
            if (!allowedFields.includes(field)) {
                throw new Error(`${field} is not a valid category field`);
            }
            const feedback = await Feedbacks.findOne({ hotelId: feedbackId });
            if (!feedback)
                throw new Error("Feedback not found");
            const item = feedback[field].id(itemId);
            if (!item)
                throw new Error("Category item not found");
            Object.assign(item, updates);
            await feedback.save();
            io.to(feedback.hotelId).emit(`feedbackCategoryItemUpdated`, { field, item });
            return item;
        },
        removeFeedbackCategoryItem: async (_, { feedbackId, field, itemId }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const allowedFields = ['satisfaction', 'improvement'];
            if (!allowedFields.includes(field)) {
                throw new Error(`${field} is not a valid category field`);
            }
            const feedback = await Feedbacks.findOne({ hotelId: feedbackId });
            if (!feedback)
                throw new Error("Feedback not found");
            const item = feedback[field].id(itemId);
            if (!item)
                throw new Error("Category item not found");
            item.deleteOne();
            await feedback.save();
            io.to(feedback.hotelId).emit(`feedbackCategoryItemRemoved`, { field, itemId });
            return feedback;
        },
        // GuestUser mutations
        createGuestUser: async (_, { input }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const newGuestUser = new GuestUser(input);
            return await newGuestUser.save();
        },
        updateGuestUser: async (_, { id, input }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            return await GuestUser.findByIdAndUpdate(id, input, { new: true });
        },
        deleteGuestUser: async (_, { id }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            await GuestUser.findByIdAndDelete(id);
            return true;
        },
        // BusinessUser mutations
        createBusinessUser: async (_, { input }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const newBusinessUser = new BusinessUser(input);
            return await newBusinessUser.save();
        },
        updateBusinessUser: async (_, { id, input }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            return await BusinessUser.findByIdAndUpdate(id, input, { new: true });
        },
        deleteBusinessUser: async (_, { id }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            await BusinessUser.findByIdAndDelete(id);
            return true;
        },
        // Support-specific mutations
        createSupport: async (_, { input }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const newSupport = new Support(input);
            const savedSupport = await newSupport.save();
            io.to(savedSupport.hotelId).emit(`supportCreated`, savedSupport);
            return savedSupport;
        },
        updateSupport: async (_, { id, updates }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const updatedSupport = await Support.findByIdAndUpdate(id, updates, { new: true });
            if (updatedSupport) {
                io.to(updatedSupport.hotelId).emit(`supportUpdated`, updatedSupport);
            }
            return updatedSupport;
        },
        deleteSupport: async (_, { id }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const support = await Support.findById(id);
            if (!support)
                throw new Error("Support not found");
            await Support.findByIdAndDelete(id);
            io.to(support.hotelId).emit(`supportDeleted`, id);
            return true;
        },
        addMessageToSupportChatRoom: async (_, { supportId, message }, // TODO: Define SupportChatRoomMessage type in types.ts
        context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const support = await Support.findOne({ hotelId: supportId });
            if (!support)
                throw new Error("Support not found");
            support.chatRoom.push(message);
            await support.save();
            io.to(supportId).emit(`supportChatRoomMessageAdded`, message);
            return support;
        },
        updateSupportChatRoomMessage: async (_, { supportId, messageId, updates }, // TODO: Define SupportChatRoomMessage type
        context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const support = await Support.findOne({ hotelId: supportId });
            if (!support)
                throw new Error("Support not found");
            const message = support.chatRoom.id(messageId);
            if (!message)
                throw new Error("Message not found");
            Object.assign(message, updates);
            await support.save();
            io.to(supportId).emit(`supportChatRoomMessageUpdated`, message);
            return message;
        },
        deleteSupportChatRoomMessage: async (_, { supportId, messageId }, context) => {
            if (!context.user) {
                throw new Error('Unauthorized');
            }
            const support = await Support.findOne({ hotelId: supportId });
            if (!support)
                throw new Error("Support not found");
            const message = support.chatRoom.id(messageId);
            if (!message)
                throw new Error("Message not found");
            message.deleteOne();
            await support.save();
            io.to(supportId).emit(`supportChatRoomMessageDeleted`, messageId);
            return support;
        },
    },
};
