import { User } from '../../models/userSchema.js';
import { Group } from '../../models/groupSchema.js';

const registerUser = async (req, res) => {
  const { email, firstName, lastName, uid, userName } = req.body;

  // Basic validation
  if (!email || !firstName || !lastName || !userName || !uid) {
    return res.status(400).json({
      message: "All fields are required.",
    });
  }

  try {
    // Check if user with the same email or userName already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({
        message: "User with this email already exists.",
      });
    }

    const existingUserByUserName = await User.findOne({ userName });
    if (existingUserByUserName) {
      return res.status(400).json({
        message: "User with this username already exists.",
      });
    }

    // Create new user
    const user = await User.create({ email, firstName, lastName, uid, userName });

    // Check if user was created successfully
    if (!user) {
      return res.status(500).json({
        message: "Something went wrong while registering the user.",
      });
    }

    // Return the newly created user
    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Error registering user:", error.message);
    return res.status(500).json({
      message: "Server error: " + error.message,
    });
  }
};

const userData = async (req, res) => {
  try {
    const { uid, socketId } = req.query; // Destructure uid and socketId from query parameters

    if (!uid) {
      return res.status(400).send('ID is required');
    }

    // Find the user by ID
    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Update the user with the new socketId and set online status to true
    const updatedUser = await User.findOneAndUpdate(
      { uid },
      { socketId, online: true }, // Update both socketId and online status
      { new: true, runValidators: true } // Return the updated user and run validators
    );

    // Log and send the updated user data
    
    res.json(updatedUser); // Send the updated user data as the response
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send('Server error: ' + error.message);
  }
};

const userDataById = async (req, res) => {
  try {
    const _id = req.query.userId;
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).send('User not found');
    } 

    res.json({
      firstName: user.firstName,
      lastName:user.lastName,
      userName: user.userName,
      online: user.online,
      _id: user._id,
    });


  }catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send('Server error: ' + error.message);
  }
};



const contactData = async (req, res) => {
  try {
    const _id = req.query._id;
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.json({
      firstName: user.firstName,
      socketId: user.socketId,
      userName: user.userName,
      online: user.online,
      _id: user._id,
    });
  } catch (error) {
    console.error("Error fetching contact data:", error);
    res.status(500).send('Server error: ' + error.message);
  }
};
const updateData = async (req, res) => {
  try {
    const uid = req.query.uid;
    const socketId = req.query.socketId;
    console.log("lp",socketId)
    if (!uid) {
      return res.status(400).send('ID is required');
    }

    // Find the user by uid
    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Update user with socketId and set online status to true
    const updatedUser = await User.findOneAndUpdate(
      { uid },
      { 
        socketId:socketId,
        online: true  // Set the online status to true
      },
      { 
        new: true, 
        runValidators: true 
      }
    );

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).send('Server error: ' + error.message);
  }
};


const userNameData = async (req, res) => {
  const userName = req.query.userName;
  console.log(userName)
  if (!userName) {
    return res.status(400).send("UserName Required");
  }

  try {
    const searchByUserName = await User.find({
      userName: { $regex: new RegExp(userName, 'i') } 
    });

    if (searchByUserName.length === 0) {
      return res.status(404).send("No User Found");
    }

    const results = searchByUserName.map(user => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
    }));

    res.json(results);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Server Error");
  }
};



const updateOnlineStatus = async (req, res) => {
  try {
    const uid  = req.query.uid; // Destructure uid from query parameters
    console.log("shubham");
    if (!uid) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Log the UID for debugging purposes
    console.log('Received UID:', uid);

    // Find the user by ID and set the online status to false
    const user = await User.findOneAndUpdate(
      { uid },
      { online: false }, // Explicitly set online status to false
      { new: true, runValidators: true } // Return the updated user
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Online status updated to false', user });
  } catch (error) {
    console.error('Error updating online status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



const creategroup = async (req, res) => {
  try {
      const creator = req?.query?.userId;
      const name = req.query?.groupName;

      // Create members array (initially just the creator)
      const members = [creator];

      // Create new group
      const newGroup = new Group({
          groupName: name,
          creator: creator,
          members: members // Use members array here
      });

      // Save the group to the database
      const savedGroup = await newGroup.save();

      // Update the creator's groups
      await User.updateOne(
          { _id: creator },
          { $addToSet: { groups: savedGroup._id } }
      );

      // Optionally update other members if needed
      // await User.updateMany(
      //     { _id: { $in: members } },
      //     { $addToSet: { groups: savedGroup._id } }
      // );

      // Respond with the created group
      console.log(savedGroup);
      res.status(201).json(savedGroup);
  } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
};



const fetchgroupdetail = async (req, res) => {
  try {
      const { groupId } = req.query; // Get groupId from query parameters

      if (!groupId) {
          return res.status(400).json({ message: 'Group ID is required' });
      }

      // Find the group by ID
      const group = await Group.findById(groupId); // Populate members

      if (!group) {
          return res.status(404).json({ message: 'Group not found' });
      }

      // Fetch messages with user details
      
      // Respond with group details and messages
      res.json(group);
  } catch (error) {
      console.error("Error fetching group detail:", error);
      res.status(500).json({ message: 'Server error: ' + error.message });
  }
};



const fetchgroup = async (req, res) => {
  const userId = req.query.userId; // Change to userId since you're passing the user ID

  if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
  }

  try {
      // Find groups where the user is a member
      const groups = await Group.find({ members: userId });
      if (!groups.length) {
          return res.status(404).json({ message: "No groups found for this user." });
      }
      console.log(groups);
      res.json(groups); // Return all groups the user belongs to
  } catch (error) {
      console.error("Error fetching group:", error);
      res.status(500).json({ message: "Server error: " + error.message });
  }
};

const searchgroup = async (req, res) => {
  const query  = req.query;

  if (!query) {
      return res.status(400).json({ message: "Search query is required." });
  }

  try {
      const groups = await Group.find({
          groupName: { $regex: new RegExp(query, 'i') }
      });

      res.json(groups);
  } catch (error) {
      console.error("Error searching groups:", error);
      res.status(500).json({ message: "Server error: " + error.message });
  }
};
const joingroup = async (req, res) => {
  const { userId, groupId } = req.query;

  if (!userId || !groupId) {
      return res.status(400).json({ message: "User ID and Group ID are required." });
  }

  try {
      const group = await Group.findByIdAndUpdate(
          groupId,
          { $addToSet: { members: userId } },
          { new: true }
      );

      if (!group) {
          return res.status(404).json({ message: "Group not found." });
      }

      res.json({ message: "Joined group successfully", group });
  } catch (error) {
      console.error("Error joining group:", error);
      res.status(500).json({ message: "Server error: " + error.message });
  }
};


const sendmessageingroup = async (req, res) => {
  const { groupId, messageContent, senderId } = req.query;

  if (!groupId || !messageContent || !senderId) {
      return res.status(400).json({ message: "Group ID, message content, and sender ID are required." });
  }

  try {
      // Update the group to add the new message
      const updatedGroup = await Group.findByIdAndUpdate(
          groupId,
          { $push: { messages: { user: senderId, message: messageContent } } },
          { new: true, runValidators: true } // Added runValidators to ensure schema validation
      );

      if (!updatedGroup) {
          return res.status(404).json({ message: "Group not found." });
      }

      // Respond with the updated group data
      res.status(201).json({ message: "Message sent successfully", data: updatedGroup.messages.pop() }); // Return only the latest message
  } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "An error occurred while sending the message." });
  }
};


const fetchgroupmessage = async (req, res) => {
  const groupId = req.query.groupId;

  if (!groupId) {
      return res.status(400).json({ message: "Group ID is required." });
  }

  try {
      const messages = await Message.find({ groupId }).populate('senderId', 'firstName lastName userName');
      res.json(messages);
  } catch (error) {
      console.error("Error fetching group messages:", error);
      res.status(500).json({ message: "Server error: " + error.message });
  }
};

export { registerUser, userData, contactData, updateData, userNameData,updateOnlineStatus,
  creategroup,
  fetchgroup,searchgroup,joingroup,sendmessageingroup,fetchgroupmessage,
  userDataById,fetchgroupdetail
 };
