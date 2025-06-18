import Hotel from '../models/hotels/hotels.ts';

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
  
    // Récupérer les éléments pour une période (matin, soir, nuit)
    getHotelChecklistByPeriod: async (_, { hotelId, period }) => {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) throw new Error("Hotel not found");
        return hotel.checklist?.[period] || [];
    },
    getHotelHousekeeping: async (_, { hotelId }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      return hotel.housekeeping || [];
    },
    getHotelRoomChange: async (_, { hotelId }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      return hotel.roomChange || [];
    },
    getHotelSafe: async (_, { hotelId }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      return hotel.safe || [];
    },
    getHotelMaintenance: async (_, { hotelId }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      return hotel.maintenance || [];
    },
    getHotelCab: async (_, { hotelId }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      return hotel.cab || [];
    },
    getHotelClock: async (_, { hotelId }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      return hotel.clock || [];
    },
    getHotelNote: async (_, { hotelId }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      return hotel.note || [];
    },
    getHotelSticker: async (_, { hotelId }) => {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) throw new Error("Hotel not found");
      return hotel.sticker || [];
    },
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
    }
  },
};