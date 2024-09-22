import mongoose from "mongoose";
import { Schema } from "mongoose";

// Define the Friend Request schemas
const friendRequestReceivedSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
});

const friendRequestSendSchema = new Schema({
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
});

// Define the User schema
const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true // Added required validation
        },
        online: {
            type: Boolean,
            default: false
        },
        firstName: {
            type: String,
            required: true // Added required validation
        },
        middleName: {
            type: String,
        },
        lastName: {
            type: String,
            required: true // Added required validation
        },
        mobileNumber: {
            type: String
        },
        email: {
            type: String,
            required: true // Added required validation
        },
        contact: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        friendRequestSend: [friendRequestSendSchema],
        friendRequestReceived: [friendRequestReceivedSchema],
        isOnline: {
            type: Boolean,
            default: false // Changed to Boolean with default
        },
        uid: {
            type: String,
            required: true
        },
        socketId: {
            type: String
        },
        group: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Group' // Assuming you have a Group model
            }
        ]
    },
    { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
