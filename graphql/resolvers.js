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
    getHotelChecklist: async (_, { hotelId }) => {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) throw new Error("Hotel not found");
        return hotel.checklist;
    },
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
    addChatToHotel: async (_, { hotelId, chat }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");

      hotel.chat.push(chat);
      await hotel.save();
      return hotel;
    },

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

    updateHotelField: async (_, { hotelId, field, value }) => {
      const update = { [field]: value };
      const updatedHotel = await Hotel.findByIdAndUpdate(hotelId, { $set: update }, { new: true });
      if (!updatedHotel) throw new Error("Hotel not found");
      return updatedHotel;
    },

    // New mutations for updating specific hotel fields
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
    updateHotelRoomChange: async (_, { hotelId, roomChange }) => {
      const updatedHotel = await Hotel.findByIdAndUpdate(hotelId, { $set: { roomChange } }, { new: true });
      if (!updatedHotel) throw new Error("Hotel not found");
      return updatedHotel;
    },
    updateHotelMaintenance: async (_, { hotelId, maintenance }) => {
      const updatedHotel = await Hotel.findByIdAndUpdate(hotelId, { $set: { maintenance } }, { new: true });
      if (!updatedHotel) throw new Error("Hotel not found");
      return updatedHotel;
    },
    updateHotelCab: async (_, { hotelId, cab }) => {
      const updatedHotel = await Hotel.findByIdAndUpdate(hotelId, { $set: { cab } }, { new: true });
      if (!updatedHotel) throw new Error("Hotel not found");
      return updatedHotel;
    },
    updateHotelClock: async (_, { hotelId, clock }) => {
      const updatedHotel = await Hotel.findByIdAndUpdate(hotelId, { $set: { clock } }, { new: true });
      if (!updatedHotel) throw new Error("Hotel not found");
      return updatedHotel;
    },
    updateHotelNote: async (_, { hotelId, note }) => {
      const updatedHotel = await Hotel.findByIdAndUpdate(hotelId, { $set: { note } }, { new: true });
      if (!updatedHotel) throw new Error("Hotel not found");
      return updatedHotel;
    },
    updateHotelSticker: async (_, { hotelId, sticker }) => {
      const updatedHotel = await Hotel.findByIdAndUpdate(hotelId, { $set: { sticker } }, { new: true });
      if (!updatedHotel) throw new Error("Hotel not found");
      return updatedHotel;
    },
    updateHotelSafe: async (_, { hotelId, safe }) => {
      const updatedHotel = await Hotel.findByIdAndUpdate(hotelId, { $set: { safe } }, { new: true });
      if (!updatedHotel) throw new Error("Hotel not found");
      return updatedHotel;
    },
    updateHotelLostAndFound: async (_, { hotelId, lostAndFound }) => {
      const updatedHotel = await Hotel.findByIdAndUpdate(hotelId, { $set: { lostAndFound } }, { new: true });
      if (!updatedHotel) throw new Error("Hotel not found");
      return updatedHotel;
    },

    addHotelCabItem: async (_, { hotelId, cabItem }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      hotel.cab.push(cabItem);
      await hotel.save();
      return hotel;
    },

    removeHotelCabItem: async (_, { hotelId, cabItemId }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      hotel.cab.id(cabItemId).remove();
      await hotel.save();
      return hotel;
    },

    addHotelClockItem: async (_, { hotelId, clockItem }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      hotel.clock.push(clockItem);
      await hotel.save();
      return hotel;
    },

    removeHotelClockItem: async (_, { hotelId, clockItemId }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      hotel.clock.id(clockItemId).remove();
      await hotel.save();
      return hotel;
    },

    addHotelNoteItem: async (_, { hotelId, noteItem }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      hotel.note.push(noteItem);
      await hotel.save();
      return hotel;
    },

    removeHotelNoteItem: async (_, { hotelId, noteItemId }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      hotel.note.id(noteItemId).remove();
      await hotel.save();
      return hotel;
    },

    addHotelStickerItem: async (_, { hotelId, stickerItem }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      hotel.sticker.push(stickerItem);
      await hotel.save();
      return hotel;
    },

    removeHotelStickerItem: async (_, { hotelId, stickerItemId }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      hotel.sticker.id(stickerItemId).remove();
      await hotel.save();
      return hotel;
    },

    addHotelRoomChangeItem: async (_, { hotelId, roomChangeItem }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      hotel.roomChange.push(roomChangeItem);
      await hotel.save();
      return hotel;
    },

    removeHotelRoomChangeItem: async (_, { hotelId, roomChangeItemId }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      hotel.roomChange.id(roomChangeItemId).remove();
      await hotel.save();
      return hotel;
    },

    addHotelSafeItem: async (_, { hotelId, safeItem }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      hotel.safe.push(safeItem);
      await hotel.save();
      return hotel;
    },

    removeHotelSafeItem: async (_, { hotelId, safeItemId }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      hotel.safe.id(safeItemId).remove();
      await hotel.save();
      return hotel;
    },

    addHotelMaintenanceItem: async (_, { hotelId, maintenanceItem }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      hotel.maintenance.push(maintenanceItem);
      await hotel.save();
      return hotel;
    },

    removeHotelMaintenanceItem: async (_, { hotelId, maintenanceItemId }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      hotel.maintenance.id(maintenanceItemId).remove();
      await hotel.save();
      return hotel;
    },

    addHotelLostAndFoundItem: async (_, { hotelId, lostAndFoundItem }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      hotel.lostAndFound.push(lostAndFoundItem);
      await hotel.save();
      return hotel;
    },

    removeHotelLostAndFoundItem: async (_, { hotelId, lostAndFoundItemId }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      hotel.lostAndFound.id(lostAndFoundItemId).remove();
      await hotel.save();
      return hotel;
    },
  },
};