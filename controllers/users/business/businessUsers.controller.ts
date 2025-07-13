import mongoose from "mongoose";
import BusinessUsers from "../../../models/businessUsers.ts";

import type { Request, Response } from 'express';

const getAllBusinessUsers = async (req: Request, res: Response) => {
    try {
        const businessUsers = await BusinessUsers.find();
        if (!businessUsers || businessUsers.length === 0) {
            return res.status(404).json({ message: "No business users found" });
        }
        res.status(200).json(businessUsers);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving business users" });
    }
}

const getBusinessUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
          
        const businessUser = await BusinessUsers.findById(id);
        if (!businessUser) {
            return res.status(404).json({ message: "Business user not found" });
        }
        res.status(200).json(businessUser);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving business user" });
    }
}

const createBusinessUser = async (req: Request, res: Response) => {
    const businessUserData = req.body;
    try {
        const newBusinessUser = new BusinessUsers(businessUserData);
        await newBusinessUser.save();
        res.status(201).json(newBusinessUser);
    } catch (error) {
        res.status(500).json({ message: "Error creating business user" });
    }
}

const updateBusinessUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const businessUserData = req.body;
    try {
        const updatedBusinessUserData = await BusinessUsers.findByIdAndUpdate(id, businessUserData, { new: true });
        if (!updatedBusinessUserData) {
            return res.status(404).json({ message: "Business user not found" });
        }
        res.status(200).json(updatedBusinessUserData);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating business user" });
    }
}

const deleteBusinessUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deletedBusinessUser = await BusinessUsers.findByIdAndDelete(id);
        if (!deletedBusinessUser) {
            return res.status(404).json({ message: "Business user not found" });
        }
        res.status(200).json({ message: "Business user deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting business user" });
    }
}

export {
    getAllBusinessUsers,
    getBusinessUserById,
    createBusinessUser,
    updateBusinessUser,
    deleteBusinessUser
}