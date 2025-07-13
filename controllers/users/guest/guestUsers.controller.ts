import GuestUsers from "../../../models/guest/guestUsers.js";
import { io } from "../../../app.js";

import type { Request, Response } from 'express';


const getAllGuestUsers = async (req: Request, res: Response) => {
    try {
        const guestUsers = await GuestUsers.find();
        if (!guestUsers || guestUsers.length === 0) {
            return res.status(404).json({ message: "No guest users found" });
        }
        res.status(200).json(guestUsers);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving guest users" });
    }
}

const getGuestUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const guestUser = await GuestUsers.findById(id);
        if (!guestUser) {
            return res.status(404).json({ message: "Guest user not found" });
        }
        res.status(200).json(guestUser);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving guest user" });
    }
}

const createGuestUser = async (req: Request, res: Response) => {
    const guestUserData = req.body;
    try {
        const newGuestUser = new GuestUsers(guestUserData);
        await newGuestUser.save();

        io.emit('guestUserCreated', newGuestUser);

        res.status(201).json(newGuestUser);
    } catch (error) {
        res.status(500).json({ message: "Error creating guest user" });
    }
}

const updateGuestUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const guestUserData = req.body;
    try {
        const updatedGuestUserData = await GuestUsers.findByIdAndUpdate(id, guestUserData, { new: true });
        if (!updatedGuestUserData) {
            return res.status(404).json({ message: "Guest user not found" });
        }

        io.emit('guestUserUpdated', updatedGuestUserData);

        res.status(200).json(updatedGuestUserData);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating guest user" });
    }
}

const deleteGuestUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deletedGuestUser = await GuestUsers.findByIdAndDelete(id);
        if (!deletedGuestUser) {
            return res.status(404).json({ message: "Guest user not found" });
        }
        res.status(200).json({ message: "Guest user deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting guest user" });
    }
}

export {
    getAllGuestUsers,
    getGuestUserById,
    createGuestUser,
    updateGuestUser,
    deleteGuestUser
}