import Hotel from '../models/hotels/hotels.ts';
import BusinessUser from '../models/businessUsers.ts';
import GuestUser from '../models/guest/guestUsers.ts';
import Support from '../models/support.ts';
import Feedbacks from '../models/feedbacks.ts';
import { getAllBusinessUsers } from '../controllers/users/business/businessUsers.controller.ts';

export const resolvers = {
  Query: {
    /*
      Récupère tous les hôtels
      @returns {Promise<Hotel[]>} Liste des hôtels
    */
    getHotels: async () => await Hotel.find(),
    getHotelById: async (_, { id }) => await Hotel.findById(id),
    getFeedbacks: async () => await Feedbacks.find(),
    getFeedbackById: async (_, { id }) => await Feedbacks.findOne({hotelId: id}),
    getSupports: async () => await Support.find(),
    getSupportById: async (_, { id }) => await Support.findOne({hotelId: id}),
    getBusinessUsers: async () => await BusinessUser.find(),
    getBusinessUserById: async (_, { id }) => await BusinessUser.findOne({userId: id}),

    // Combined user queries
    getGuestUsers: async () => {
      const guestUsers = await GuestUser.find();
      return guestUsers
    },
    getGuestUserById: async (_, { id }) => {
      const guestUser = await GuestUser.findOne({userId: id});
      return guestUser;
    },
  },

  Mutation: {
    createHotel: async (_, { input }) => {
      const newHotel = new Hotel(input);
      return await newHotel.save();
    },
    updateHotel: async (_, { id, input }) => {
      return await Hotel.findByIdAndUpdate(id, input, { new: true });
    },

    deleteHotel: async (_, { id }) => {
      const result = await Hotel.findByIdAndDelete(id);
      return "Hotel deleted";
    },
    // New mutations for updating specific hotel fields
    addHotelFieldItem: async (_, { hotelId, field, item }) => {
      const allowedFields = ['cab', 'note', 'sticker', 'clock', 'safe', 'roomChange', 'maintenance', 'lostAndFound', 'chat'];
    
      if (!allowedFields.includes(field)) {
        throw new Error(`${field} is not allowed or is not a list field`);
      }
    
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
    
      if (!Array.isArray(hotel[field])) {
        throw new Error(`${field} is not an array`);
      }
    
      hotel[field].push(item);
      await hotel.save();
      return hotel;
    },
    removeHotelFieldItem: async (_, { hotelId, field, itemId }) => {
      const allowedFields = ['cab', 'note', 'sticker', 'clock', 'safe', 'roomChange', 'maintenance', 'lostAndFound', 'chat'];

      if (!allowedFields.includes(field)) {
        throw new Error(`${field} is not allowed or is not a list field`);
      }

      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      if (!Array.isArray(hotel[field])) {
        throw new Error(`${field} is not an array`);
      }

      const item = hotel[field].id(itemId);
      if (!item) {
        throw new Error(`Item with ID ${itemId} not found in ${field}`);
      }

      item.deleteOne();
      await hotel.save();
      return hotel;
    },
    updateHotelFieldItem: async (_, { hotelId, field, itemId, updates }) => {
      const allowedFields = ['cab', 'note', 'sticker', 'clock', 'safe', 'roomChange', 'maintenance', 'lostAndFound', 'chat'];

      if (!allowedFields.includes(field)) {
        throw new Error(`${field} is not allowed or is not a list field`);
      }

      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      if (!Array.isArray(hotel[field])) {
        throw new Error(`${field} is not an array`);
      }

      const item = hotel[field].id(itemId);
      if (!item) {
        throw new Error(`Item with ID ${itemId} not found in ${field}`);
      }

      Object.assign(item, updates);
      await hotel.save();
      return item;
    },

    createChecklist: async (_, { hotelId, checklist }) => {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) throw new Error("Hotel not found");

        hotel.checklist = checklist;
        await hotel.save();
        return hotel.checklist;
    },
    addChecklistItem: async (_, { hotelId, period, item }) => {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) throw new Error("Hotel not found");

        if (!hotel.checklist[period]) hotel.checklist[period] = [];
        hotel.checklist[period].push(item);
        await hotel.save();
        return item;
    },
    updateChecklistItem: async (_, { hotelId, period, itemId, updates }) => {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) throw new Error("Hotel not found");

        const item = hotel.checklist[period]?.id(itemId);
        if (!item) throw new Error("Checklist item not found");

        Object.assign(item, updates);
        await hotel.save();
        return item;
    },
    deleteChecklistItem: async (_, { hotelId, period, itemId }) => {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) throw new Error("Hotel not found");

        hotel.checklist[period].pull(itemId);
        await hotel.save();
        return "Item deleted";
    },

    // Chat-specific mutations
    removeChatFromHotel: async (_, { hotelId, userId }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      hotel.chat = hotel.chat.filter(c => c.userId !== userId);
      await hotel.save();
      return hotel;
    },

    addMessageToChatRoom: async (_, { hotelId, userId, message }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      const chatEntry = hotel.chat.find(c => c.userId === userId);
      if (!chatEntry) throw new Error("Chat not found for user");

      chatEntry.chatRoom.push(message);
      await hotel.save();
      return chatEntry;
    },

    updateChatRoomMessage: async (_, { hotelId, userId, messageId, updates }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      const chatEntry = hotel.chat.find(c => c.userId === userId);
      if (!chatEntry) throw new Error("Chat not found for user");

      const message = chatEntry.chatRoom.id(messageId);
      if (!message) throw new Error("Message not found");

      Object.assign(message, updates);
      await hotel.save();
      return message;
    },

    deleteChatRoomMessage: async (_, { hotelId, userId, messageId }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      const chatEntry = hotel.chat.find(c => c.userId === userId);
      if (!chatEntry) throw new Error("Chat not found for user");

      const message = chatEntry.chatRoom.id(messageId);
      if (!message) throw new Error("Message not found");

      message.deleteOne();
      await hotel.save();
      return chatEntry;
    },

    addChatToHotel: async (_, { hotelId, chat }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      hotel.chat.push(chat);
      await hotel.save();
      return hotel;
    },

    updateChatFromHotel: async (_, { hotelId, userId, updates }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      const chatEntry = hotel.chat.find(c => c.userId === userId);
      if (!chatEntry) throw new Error("Chat not found");

      Object.assign(chatEntry, updates);
      await hotel.save();
      return chatEntry;
    },

    // Housekeeping-specific mutations
    addHousekeepingItem: async (_, { hotelId, category, item }) => {
      const hotel = await Hotel.findById(hotelId);
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
      return hotel.housekeeping[category];
    },

    updateHousekeepingItem: async (_, { hotelId, category, itemId, updates }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      const housekeepingCategories = ['towel', "pillow", "blanket", "soap", "babyBed", "iron", "toiletPaper", "hairDryer"];
      if (!housekeepingCategories.includes(category)) {
        throw new Error(`${category} is not a valid housekeeping category`);
      }

      const item = hotel.housekeeping[category]?.id(itemId);
      if (!item) throw new Error("Housekeeping item not found");

      Object.assign(item, updates);
      await hotel.save();
      return item;
    },

    removeHousekeepingItem: async (_, { hotelId, category, itemId }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      const housekeepingCategories = ['towel', "pillow", "blanket", "soap", "babyBed", "iron", "toiletPaper", "hairDryer"];
      if (!housekeepingCategories.includes(category)) {
        throw new Error(`${category} is not a valid housekeeping category`);
      }

      if (!Array.isArray(hotel.housekeeping[category])) {
        throw new Error(`${category} is not a valid housekeeping category`);
      }

      const item = hotel.housekeeping[category].id(itemId);
      if (!item) throw new Error("Item not found");

      item.deleteOne();
      await hotel.save();
      return hotel.housekeeping[category];
    },

    // Feedback mutations
    createFeedback: async (_, { input }) => {
      const newFeedback = new Feedbacks(input);
      return await newFeedback.save();
    },
    updateFeedback: async (_, { id, input }) => {
      return await Feedbacks.findByIdAndUpdate(id, input, { new: true });
    },
    deleteFeedback: async (_, { id }) => {
      await Feedbacks.findByIdAndDelete(id);
      return true;
    },

    // Feedback Category mutations (generic for satisfaction & improvement)
    addFeedbackCategoryItem: async (_, { feedbackId, field, category }) => {
      const allowedFields = ['satisfaction', 'improvement'];
      if (!allowedFields.includes(field)) {
        throw new Error(`${field} is not a valid category field`);
      }

      const feedback = await Feedbacks.findOne({hotelId: feedbackId});
      if (!feedback) throw new Error("Feedback not found");

      feedback[field].push(category);
      await feedback.save();
      return feedback;
    },

    updateFeedbackCategoryItem: async (_, { feedbackId, field, itemId, updates }) => {
      const allowedFields = ['satisfaction', 'improvement'];
      if (!allowedFields.includes(field)) {
        throw new Error(`${field} is not a valid category field`);
      }

      const feedback = await Feedbacks.findOne({hotelId: feedbackId});
      if (!feedback) throw new Error("Feedback not found");

      const item = feedback[field].id(itemId);
      if (!item) throw new Error("Category item not found");

      Object.assign(item, updates);
      await feedback.save();
      return item;
    },

    removeFeedbackCategoryItem: async (_, { feedbackId, field, itemId }) => {
      const allowedFields = ['satisfaction', 'improvement'];
      if (!allowedFields.includes(field)) {
        throw new Error(`${field} is not a valid category field`);
      }

      const feedback = await Feedbacks.findOne({hotelId: feedbackId});
      if (!feedback) throw new Error("Feedback not found");

      const item = feedback[field].id(itemId);
      if (!item) throw new Error("Category item not found");

      item.deleteOne();
      await feedback.save();
      return feedback;
    },

    // GuestUser mutations
    createGuestUser: async (_, { input }) => {
      const newGuestUser = new GuestUser(input);
      return await newGuestUser.save();
    },
    updateGuestUser: async (_, { id, input }) => {
      return await GuestUser.findByIdAndUpdate(id, input, { new: true });
    },
    deleteGuestUser: async (_, { id }) => {
      await GuestUser.findByIdAndDelete(id);
      return true;
    },

    // BusinessUser mutations
    createBusinessUser: async (_, { input }) => {
      const newBusinessUser = new BusinessUser(input);
      return await newBusinessUser.save();
    },
    updateBusinessUser: async (_, { id, input }) => {
      return await BusinessUser.findByIdAndUpdate(id, input, { new: true });
    },
    deleteBusinessUser: async (_, { id }) => {
      await BusinessUser.findByIdAndDelete(id);
      return true;
    },

    // Support-specific mutations
    createSupport: async (_, { input }) => {
      const newSupport = new Support(input);
      return await newSupport.save();
    },
    updateSupport: async (_, { id, updates }) => {
      return await Support.findByIdAndUpdate(id, updates, { new: true });
    },
    deleteSupport: async (_, { id }) => {
      await Support.findByIdAndDelete(id);
      return true;
    },
    addMessageToSupportChatRoom: async (_, { supportId, message }) => {
      const support = await Support.findOne({hotelId: supportId});
      if (!support) throw new Error("Support not found");

      support.chatRoom.push(message);
      await support.save();
      return support;
    },
    updateSupportChatRoomMessage: async (_, { supportId, messageId, updates }) => {
      const support = await Support.findOne({hotelId: supportId});
      if (!support) throw new Error("Support not found");

      const message = support.chatRoom.id(messageId);
      if (!message) throw new Error("Message not found");

      Object.assign(message, updates);
      await support.save();
      return message;
    },
    deleteSupportChatRoomMessage: async (_, { supportId, messageId }) => {
      const support = await Support.findOne({hotelId: supportId});
      if (!support) throw new Error("Support not found");

      const message = support.chatRoom.id(messageId);
      if (!message) throw new Error("Message not found");

      message.deleteOne();
      await support.save();
      return support;
    },
  },
};