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
    getHotelChecklistByPeriod(hotelId: ID!, period: String!): [ChecklistItem]
  }

  #########################
  # GraphQL Mutations Definitions

  type Mutation {
  # Mutations for Hotels
    createHotel(input: HotelInput!): Hotel
    updateHotel(id: ID!, input: HotelInput!): Hotel
    deleteHotel(id: ID!): Boolean

  # Mutations for Checklists
    createChecklist(input: ChecklistInput!): Checklist
    addChecklistItem(id: ID!, period: String!, item: ChecklistItemInput!): Checklist
    updateChecklistItem(id: ID!, period: String!, itemId: ID!, item: ChecklistItemInput!): Checklist
    deleteChecklistItem(id: ID!, period: String!, itemId: ID!): Checklist
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
    markup: Float
    reason: String
    reasonClone: String
    state: String
    status: Boolean
    toRoom: String
    userId: String
  }

  input RoomChangeItemInput {
    author: String
    client: String
    date: String
    details: String
    fromRoom: String
    img: String
    markup: Float
    reason: String
    reasonClone: String
    state: String
    status: Boolean
    toRoom: String
    userId: String
  }

  type SafeItem {
    _id: ID
    author: String
    date: String
    hour: String
    img: String
    isChecked: Boolean
    markup: Float
    status: String
    text: String
    title: String
    userId: String
  }

  input SafeItemInput {
    author: String
    date: String
    hour: String
    img: String
    isChecked: Boolean
    markup: Float
    status: String
    text: String
    title: String
    userId: String
  }

  type MaintenanceItem {
    _id: ID
    author: String
    date: String
    hour: String
    img: String
    isChecked: Boolean
    markup: Float
    status: String
    text: String
    title: String
    userId: String
  }

  input MaintenanceItemInput {
    author: String
    date: String
    hour: String
    img: String
    isChecked: Boolean
    markup: Float
    status: String
    text: String
    title: String
    userId: String
  }

  type CabItem {
    _id: ID
    author: String
    date: String
    hour: String
    img: String
    isChecked: Boolean
    markup: Float
    status: String
    text: String
    title: String
    userId: String
  }

  input CabItemInput {
    author: String
    date: String
    hour: String
    img: String
    isChecked: Boolean
    markup: Float
    status: String
    text: String
    title: String
    userId: String
  }

  type ClockItem {
    _id: ID
    author: String
    date: String
    hour: String
    img: String
    isChecked: Boolean
    markup: Float
    status: String
    text: String
    title: String
    userId: String
  }

  input ClockItemInput {
    author: String
    date: String
    hour: String
    img: String
    isChecked: Boolean
    markup: Float
    status: String
    text: String
    title: String
    userId: String
  }

  type NoteItem {
    _id: ID
    author: String
    date: String
    hour: String
    img: String
    isChecked: Boolean
    markup: Float
    status: String
    text: String
    title: String
    userId: String
  }

  input NoteItemInput {
    author: String
    date: String
    hour: String
    img: String
    isChecked: Boolean
    markup: Float
    status: String
    text: String
    title: String
    userId: String
  }

  type StickerItem {
    _id: ID
    author: String
    date: String
    hour: String
    img: String
    isChecked: Boolean
    markup: Float
    status: String
    text: String
    title: String
    userId: String
  }

  input StickerItemInput {
    author: String
    date: String
    hour: String
    img: String
    isChecked: Boolean
    markup: Float
    status: String
    text: String
    title: String
    userId: String
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