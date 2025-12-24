import { Request, Response, NextFunction } from 'express';
import { Contact } from '../models/contact.model';

export const createMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, subject, message } = req.body;

        const newMessage = await Contact.create({
            name,
            email,
            subject,
            message,
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: newMessage,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllMessages = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages,
        });
    } catch (error) {
        next(error);
    }
};
