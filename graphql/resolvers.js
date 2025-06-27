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

    // Récupérer toutes les checklists pour un hôtel donné
    // getHotelChecklist: async (_, { hotelId }) => {
    //     const hotel = await Hotel.findById(hotelId);
    //     if (!hotel) throw new Error("Hotel not found");
    //     return hotel.checklist;
    // },
    getBusinessUsers: async () => await BusinessUser.find(),
    getBusinessUserById: async (_, { id }) => await BusinessUser.find(id),
  },

  Mutation: {
    /*
      Crée un nouvel hôtel
      @param {Object} input - Les détails de l'hôtel à créer
      @returns {Promise<Hotel>} L'hôtel créé
    */
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

    /*Création d'une checklist pour un hôtel
        @param {String} hotelId - L'ID de l'hôtel
        @param {Object} checklist - La checklist à créer
        @returns {Promise<Object>} La checklist créée
    */
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

    updateHotelChecklist: async (_, { hotelId, checklist }) => {
      const updatedHotel = await Hotel.findByIdAndUpdate(hotelId, { $set: { checklist } }, { new: true });
      if (!updatedHotel) throw new Error("Hotel not found");
      return updatedHotel;
    },
    updateHotelHousekeeping: async (_, { hotelId, housekeeping }) => {
      const updatedHotel = await Hotel.findByIdAndUpdate(hotelId, { $set: { housekeeping } }, { new: true });
      if (!updatedHotel) throw new Error("Hotel not found");
      return updatedHotel;
    },
    updateHotelChats: async (_, { hotelId, chat }) => {
      const updatedHotel = await Hotel.findByIdAndUpdate(hotelId, { $set: { chat } }, { new: true });
      if (!updatedHotel) throw new Error("Hotel not found");
      return updatedHotel;
    },
  },
};