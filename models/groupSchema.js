import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const messageSchema=new Schema({
    user:{
        type:Schema.Types.ObjectId,
        required:true
    },
    message:{
        type:String
    }
},{timestamps:true});

const GroupSchema = new Schema(
    {
        creator: { // Changed from 'creater' to 'creator'
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User' // Reference to the User model
            }
        ],
        groupName: {
            type: String,
            required: true
        },
        socket:{
            type:String
        },
        messages:[messageSchema]
    },
    { timestamps: true } // Fixed the option name
);

export const Group = mongoose.model('Group', GroupSchema);
