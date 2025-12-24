import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied';
    createdAt: Date;
    updatedAt: Date;
}

const contactSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        subject: { type: String, required: true, trim: true },
        message: { type: String, required: true },
        status: {
            type: String,
            enum: ['new', 'read', 'replied'],
            default: 'new',
        },
    },
    { timestamps: true }
);

export const Contact = mongoose.model<IContact>('Contact', contactSchema);
