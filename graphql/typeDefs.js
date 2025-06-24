import { gql } from 'apollo-server-express';

export const typeDefs = gql`
 ##########################
 # GraphQL Query Definitions

  type Query {
    # Queries for Hotels
      getHotels: [Hotel]
      getHotelById(id: ID!): Hotel

    # Queries for Checklists
      getHotelChecklist(hotelId: ID!): Checklist

    # Queries for Features
      getHotelHousekeeping(hotelId: ID!): Housekeeping
      getHotelHousekeepingByCategory(hotelId: ID!, category: String!): [HousekeepingItemEntry]
      getHotelRoomChange(hotelId: ID!): [RoomChangeItem]
      getHotelSafe(hotelId: ID!): [SafeItem]
      getHotelMaintenance(hotelId: ID!): [MaintenanceItem]
      getHotelCab(hotelId: ID!): [CabItem]
      getHotelClock(hotelId: ID!): [ClockItem]
      getHotelNote(hotelId: ID!): [NoteItem]
      getHotelSticker(hotelId: ID!): [StickerItem]

    # Queries for Chat
      getChatByUserId(userId: String!): [Chat]
      getChatByRoom(room: String!): Chat

    # Queries for Guest Users
      getGuestUsers: [GuestUser]
      getGuestUserById(id: ID!): GuestUser

    # Queries for Business Users
      getBusinessUsers: [BusinessUser]
      getBusinessUserById(id: ID!): BusinessUser

    # Queries for Feedback
      getFeedbacks: [Feedback]
      getFeedbackById(id: ID!): Feedback
      
    # Queries for Support
      getSupports: [Support]
      getSupportById(id: ID!): Support
  }

  #########################
  # GraphQL Mutations Definitions

  type Mutation {
    # Mutations for Hotels
      createHotel(input: HotelInput!): Hotel
      updateHotel(id: ID!, input: HotelInput!): Hotel
      deleteHotel(id: ID!): Boolean
      updateHotelField(hotelId: ID!, field: String!, value: String!): Hotel
      updateHotelChecklist(hotelId: ID!, checklist: ChecklistInput!): Hotel
      updateHotelHousekeeping(hotelId: ID!, housekeeping: HousekeepingInput!): Hotel
      updateHotelChats(hotelId: ID!, chat: [ChatInput]!): Hotel
      updateHotelRoomChange(hotelId: ID!, roomChange: [RoomChangeItemInput]!): Hotel
      updateHotelMaintenance(hotelId: ID!, maintenance: [MaintenanceItemInput]!): Hotel
      updateHotelCab(hotelId: ID!, cab: [CabItemInput]!): Hotel
      updateHotelClock(hotelId: ID!, clock: [ClockItemInput]!): Hotel
      updateHotelNote(hotelId: ID!, note: [NoteItemInput]!): Hotel
      updateHotelSticker(hotelId: ID!, sticker: [StickerItemInput]!): Hotel
      updateHotelSafe(hotelId: ID!, safe: [SafeItemInput]!): Hotel
      updateHotelLostAndFound(hotelId: ID!, lostAndFound: [LostAndFoundItemInput]!): Hotel

    # Mutations for Checklists
      createChecklist(input: ChecklistInput!): Checklist
      addChecklistItem(hotelId: ID!, period: String!, item: ChecklistItemInput!): Checklist
      updateChecklistItem(hotelId: ID!, period: String!, itemId: ID!, item: ChecklistItemInput!): Checklist
      deleteChecklistItem(hotelId: ID!, period: String!, itemId: ID!): Checklist

    # Chat-specific mutations
      addChatToHotel(hotelId: ID!, chat: ChatInput!): Hotel
      removeChatFromHotel(hotelId: ID!, userId: String!): Hotel
      addMessageToChatRoom(hotelId: ID!, userId: String!, message: ChatRoomMessageInput!): Chat

    # Add and remove items for complex hotel fields
    addHotelCabItem(hotelId: ID!, cabItem: CabItemInput!): Hotel
    removeHotelCabItem(hotelId: ID!, cabItemId: ID!): Hotel

    addHotelClockItem(hotelId: ID!, clockItem: ClockItemInput!): Hotel
    removeHotelClockItem(hotelId: ID!, clockItemId: ID!): Hotel

    addHotelNoteItem(hotelId: ID!, noteItem: NoteItemInput!): Hotel
    removeHotelNoteItem(hotelId: ID!, noteItemId: ID!): Hotel

    addHotelStickerItem(hotelId: ID!, stickerItem: StickerItemInput!): Hotel
    removeHotelStickerItem(hotelId: ID!, stickerItemId: ID!): Hotel

    addHotelRoomChangeItem(hotelId: ID!, roomChangeItem: RoomChangeItemInput!): Hotel
    removeHotelRoomChangeItem(hotelId: ID!, roomChangeItemId: ID!): Hotel

    addHotelSafeItem(hotelId: ID!, safeItem: SafeItemInput!): Hotel
    removeHotelSafeItem(hotelId: ID!, safeItemId: ID!): Hotel

    addHotelMaintenanceItem(hotelId: ID!, maintenanceItem: MaintenanceItemInput!): Hotel
    removeHotelMaintenanceItem(hotelId: ID!, maintenanceItemId: ID!): Hotel

    addHotelLostAndFoundItem(hotelId: ID!, lostAndFoundItem: LostAndFoundItemInput!): Hotel
    removeHotelLostAndFoundItem(hotelId: ID!, lostAndFoundItemId: ID!): Hotel
  }

  #########################
  # Hotel Type Definitions

  type Hotel {
    id: ID!
    country: String!
    code_postal: String!
    partnership: Boolean!
    departement: String!
    mail: String!
    city: String!
    classement: String!
    hotelName: String!
    room: String!
    phone: String!
    adresse: String!
    region: String!
    website: String
    pricingModel: String
    base64Url: String
    appLink: String
    logo: String
    cab: [CabItem]
    clock: [ClockItem]
    note: [NoteItem]
    sticker: [StickerItem]
    housekeeping: Housekeeping
    roomChange: [RoomChangeItem]
    safe: [SafeItem]
    maintenance: [MaintenanceItem]
    checklist: Checklist
    chat: [Chat]
    lostAndFound: [LostAndFoundItem]
  }

  input HotelInput {
    country: String
    code_postal: String
    partnership: Boolean
    departement: String
    mail: String
    city: String
    classement: String
    hotelName: String
    room: String
    phone: String
    adresse: String
    region: String
    website: String
    pricingModel: String
    base64Url: String
    appLink: String
    logo: String
    cab: [CabItemInput]
    clock: [ClockItemInput]
    note: [NoteItemInput]
    sticker: [StickerItemInput]
    housekeeping: HousekeepingInput
    roomChange: [RoomChangeItemInput]
    safe: [SafeItemInput]
    maintenance: [MaintenanceItemInput]
    checklist: ChecklistInput
    chat: [ChatInput]
    lostAndFound: [LostAndFoundItemInput]
  }


  # Checklist Type Definitions

  type ChecklistItem {
    task: String!
    status: Boolean!
    createdAt: String
    updatedAt: String
  }

  type Checklist {
    morning: [ChecklistItem]
    evening: [ChecklistItem]
    night: [ChecklistItem]
  }

  input ChecklistItemInput {
    task: String!
    status: Boolean!
  }

  input ChecklistInput {
    morning: [ChecklistItemInput]
    evening: [ChecklistItemInput]
    night: [ChecklistItemInput]
  }


  #########################
  # Housekeeping Type Definitions

  type HousekeepingItemEntry {
    checkoutDate: String!
    client: String!
    room: String!
    createdAt: String
    updatedAt: String
  }

  input HousekeepingItemEntryInput {
    checkoutDate: String!
    client: String!
    room: String!
  }

  type Housekeeping {
    towel: [HousekeepingItemEntry]
    pillow: [HousekeepingItemEntry]
    iron: [HousekeepingItemEntry]
    toiletPaper: [HousekeepingItemEntry]
    blanket: [HousekeepingItemEntry]
    soap: [HousekeepingItemEntry]
    hairDryer: [HousekeepingItemEntry]
    babyBed: [HousekeepingItemEntry]
  }

  input HousekeepingInput {
    towel: [HousekeepingItemEntryInput]
    pillow: [HousekeepingItemEntryInput]
    iron: [HousekeepingItemEntryInput]
    toiletPaper: [HousekeepingItemEntryInput]
    blanket: [HousekeepingItemEntryInput]
    soap: [HousekeepingItemEntryInput]
    hairDryer: [HousekeepingItemEntryInput]
    babyBed: [HousekeepingItemEntryInput]
  }


  #########################
  # Additional Type Definitions

  type RoomChangeItem {
    _id: ID
    author: String
    client: String
    date: String
    details: String
    fromRoom: String
    img: String
    reason: String
    reasonClone: String
    state: String
    status: Boolean
    toRoom: String
  }

  input RoomChangeItemInput {
    author: String
    client: String
    date: String
    details: String
    fromRoom: String
    img: String
    reason: String
    reasonClone: String
    state: String
    status: Boolean
    toRoom: String
  }

  type SafeItem {
    _id: ID
    amount: String
    author: String
    date: String
    shift: String
    shiftClone: String
  }

  input SafeItemInput {
    amount: String
    author: String
    date: String
    shift: String
    shiftClone: String
  }

  type MaintenanceItem {
    _id: ID
    author: String
    client: String
    date: String
    details: String
    room: String
    img: String
    status: String
    category: String
    categoryClone: String
  }

  input MaintenanceItemInput {
    author: String
    client: String
    date: String
    details: String
    room: String
    img: String
    status: String
    category: String
    categoryClone: String
  }

  type CabItem {
    _id: ID
    author: String
    client: String
    date: String
    hour: String
    destination: String
    room: String
    status: String
    model: String
    modelClone: String
    pax: String
  }

  input CabItemInput {
    author: String
    client: String
    date: String
    hour: String
    destination: String
    room: String
    status: String
    model: String
    modelClone: String
    pax: String
  }

  type ClockItem {
    _id: ID
    author: String
    client: String
    date: String
    day: Float
    hour: String
    room: String
    status: String
  }

  input ClockItemInput {
    author: String
    client: String
    date: String
    day: Float
    hour: String
    room: String
    status: String
  }

  type NoteItem {
    _id: ID
    author: String
    date: String
    hour: String
    img: String
    isChecked: Boolean
    status: String
    text: String
    title: String
  }

  input NoteItemInput {
    author: String
    date: String
    hour: String
    img: String
    isChecked: Boolean
    status: String
    text: String
    title: String
  }

  type StickerItem {
    _id: ID
    author: String
    text: String
    title: String
  }

  input StickerItemInput {
    author: String
    text: String
    title: String
  }

  type LostAndFoundItem {
    _id: ID
    author: String
    date: String
    description: String
    details: String
    img: String
    place: String
    placeClone: String
    status: String
    category: String
  } 

  input LostAndFoundItemInput {
    author: String
    date: String
    description: String
    details: String
    img: String
    place: String
    placeClone: String
    status: String
    category: String
  } 

  #########################
  # Chat Type Definitions

  type ChatRoomMessage {
    author: String!
    date: String!
    email: String!
    photo: String
    room: String!
    text: String!
    title: String!
    userId: String
  }

  input ChatRoomMessageInput {
    author: String!
    date: String!
    email: String!
    photo: String
    room: String!
    text: String!
    title: String!
    userId: String
  }

  type Chat {
    clientFullName: String!
    checkoutDate: String
    guestLanguage: String!
    hotelResponding: Boolean
    isChatting: Boolean
    room: String
    status: Boolean
    token: Token
    userId: String!
    chatRoom: [ChatRoomMessage]
  }

  input ChatInput {
    clientFullName: String!
    checkoutDate: String
    guestLanguage: String!
    hotelResponding: Boolean
    isChatting: Boolean
    room: String
    status: Boolean
    token: TokenInput
    userId: String!
    chatRoom: [ChatRoomMessageInput]
  }

  type Token {
    endpoint: String!
    expirationTime: String
    keys: TokenKeys!
  }

  input TokenInput {
    endpoint: String!
    expirationTime: String
    keys: TokenKeysInput!
  }

  type TokenKeys {
    auth: String!
    p256dh: String!
  }

  input TokenKeysInput {
    auth: String!
    p256dh: String!
  }

  #########################
  # Guest User Type Definitions

  type GuestUser {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    roomNumber: String!
    hotelId: String!
    createdAt: String
    updatedAt: String
  }

  input GuestUserInput {
    firstName: String!
    lastName: String!
    email: String!
    roomNumber: String!
    hotelId: String!
  }

  #########################
  # Business User Type Definitions

  type BusinessUser {
    id: ID!
    email: String!
    role: String!
    hotelId: String!
    createdAt: String
    updatedAt: String
  }

  input BusinessUserInput {
    email: String!
    role: String!
    hotelId: String!
  }

  #########################
  # Feedback Type Definitions

  type Category {
    author: String!
    hotelDept: String!
    hotelName: String!
    hotelRegion: String!
    text: String!
  }

  input CategoryInput {
    author: String!
    hotelDept: String!
    hotelName: String!
    hotelRegion: String!
    text: String!
  }

  type Feedback {
    id: ID!
    hotelId: String!
    satisfaction: [Category]
    improvement: [Category]
    createdAt: String
    updatedAt: String
  }

  input FeedbackInput {
    hotelId: String!
    satisfaction: [CategoryInput]
    improvement: [CategoryInput]
  }

  #########################
  # Support Type Definitions

  type Support {
    id: ID!
    guestLanguage: String!
    hotelResponding: Boolean!
    isChatting: Boolean!
    markup: Float!
    room: String!
    status: Boolean!
    title: String!
    token: Token
    userId: String!
    chatRoom: [ChatRoomMessage]
    createdAt: String
    updatedAt: String
  }

  input SupportInput {
    guestLanguage: String!
    hotelResponding: Boolean!
    isChatting: Boolean!
    markup: Float!
    room: String!
    status: Boolean!
    title: String!
    token: TokenInput
    userId: String!
    chatRoom: [ChatRoomMessageInput]
  }
`;