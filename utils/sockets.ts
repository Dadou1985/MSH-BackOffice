// /sockets/chat.socket.js

import { Server, Socket } from 'socket.io';

/**
 * Fonction pour enregistrer tous les gestionnaires d'événements liés au chat via socket.io
 * @param {Server} io - instance du serveur socket.io
 */
export function registerChatSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log('🟢 Nouveau client connecté :', socket.id);

    /**
     * Le client peut rejoindre une "room" (ex : un salon de chat)
     * Cela permet d'envoyer des messages uniquement à un sous-ensemble de clients.
     */
    socket.on('joinRoom', roomId => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} a rejoint la room ${roomId}`);
    });

    /**
     * Lorsqu'un client envoie un message dans une room,
     * on le rediffuse à tous les clients présents dans cette room.
     */
    socket.on(
      'sendMessage',
      ({ roomId, message }: { roomId: string; message: string }) => {
        io.to(roomId).emit('receiveMessage', message);
      }
    );

    /**
     * Événement déclenché lors de la déconnexion d'un client
     */
    socket.on('disconnect', () => {
      console.log('🔴 Client déconnecté :', socket.id);
    });
  });
}

export function registerAppSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log('🟢 Nouveau client connecté :', socket.id);

    // Rejoindre une room dédiée à un hôtel
    socket.on('joinHotelRoom', (hotelId: string) => {
      socket.join(hotelId);
      console.log(
        `Socket ${socket.id} a rejoint la room de l'hôtel ${hotelId}`
      );
    });

    // Création d’un item dans un sous-document (ex: housekeeping, cab, etc.)
    socket.on(
      'createItem',
      ({
        hotelId,
        type,
        item,
      }: {
        hotelId: string;
        type: string;
        item: any;
      }) => {
        io.to(hotelId).emit(`${type}Created`, item);
      }
    );

    // Mise à jour d’un item
    socket.on(
      'updateItem',
      ({
        hotelId,
        type,
        item,
      }: {
        hotelId: string;
        type: string;
        item: any;
      }) => {
        io.to(hotelId).emit(`${type}Updated`, item);
      }
    );

    // Suppression d’un item
    socket.on(
      'deleteItem',
      ({
        hotelId,
        type,
        itemId,
      }: {
        hotelId: string;
        type: string;
        itemId: string;
      }) => {
        io.to(hotelId).emit(`${type}Deleted`, itemId);
      }
    );

    // Déconnexion
    socket.on('disconnect', () => {
      console.log('🔴 Client déconnecté :', socket.id);
    });
  });
}
