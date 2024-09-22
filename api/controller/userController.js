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

  if (!userName) {
    return res.status(400).send("UserName Required");
  }

  try {
    const searchByUserName = await User.find({
      userName: { $regex: new RegExp(userName, 'i') } // Partial match with case-insensitivity
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
  const userId = req.query.userId; // Use req.body for POST requests
  const groupName = req.query.groupName; // Use req.body for POST requests

  

  try {
      // Find the user by ID (assuming you have a User model)
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      console.log('1');
        // Create a new group
        const newGroup = new Group({
          creator: user._id, // Ensure this is correct
          members: [user._id], // Initialize with the owner as a member
          groupName: groupName, // Set the group name
      });
      await newGroup.save();
      console.log('2');
      // Add the new group's ID to the user's groups
      user.group.push(newGroup._id); // Assuming user.groups is an array of ObjectId
      await user.save();

      return res.status(200).json({
          message: 'Group created successfully',
          group: newGroup, // Optionally return the created group
      });
  } catch (error) {
      console.error("Error creating group:", error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};



const fetchgroup = async (req, res) => {
  const userId = req.query.userId; 

  try {
      const user = await User.findById(userId).populate('group'); // Populate the group field

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({
          message: 'Groups fetched successfully',
          groups: user.group, // Assuming group is an array of group IDs
      });
  } catch (error) {
      console.error("Error fetching groups:", error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};


const searchgroup = async (req, res) => {
  const query = req.query.query; // Extract query from params
console.log(query);
  try {
      // Fetch groups that the user is a member of and match the search query
      const groups = await Group.find({
          groupName: { $regex: query, $options: 'i' } // Case-insensitive search
      });
console.log(groups);
      return res.status(200).json({ groups });
  } catch (error) {
      console.error("Error searching groups:", error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};

const joingroup = async (req, res) => {
  const userId= req.query.userId;
  const groupId =req.query.groupId; 

  console.log("joij");
  try {
      // Find the group by ID
      const group = await Group.findById(groupId);
      if (!group) {
          return res.status(404).json({ message: 'Group not found' });
      }

      // Check if the user is already a member
      if (group.members.includes(userId)) {
          return res.status(400).json({ message: 'User is already a member of this group' });
      }

      group.members.push(userId);
      await group.save();

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      
      user.group.push(groupId);
      await user.save();

      return res.status(200).json({ message: 'User successfully joined the group', group });
  } catch (error) {
      console.error("Error joining group:", error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};



const sendmessageingroup = async (req, res) => {
  const groupId= req.query.groupId;
  const userId= req.query.userId;
  const messageContent = req.query.messageContent;
  console.log("ko",groupId,userId,messageContent);
  try {
      // Find the group by ID
      const group = await Group.findById(groupId);
      if (!group) {
          return res.status(404).json({ message: 'Group not found' });
      }

      // Check if the user is a member of the group
      if (!group.members.includes(userId)) {
          return res.status(403).json({ message: 'You are not a member of this group' });
      }

      // Create the new message
      const newMessage = {
          user: userId,
          message: messageContent,
      };

      // Push the new message to the group's messages array
      group.messages.push(newMessage);
      await group.save();

      return res.status(200).json({
          message: 'Message sent successfully',
          newMessage,
      });
  } catch (error) {
      console.error("Error sending message:", error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};


const fetchgroupmessage = async (req, res) => {
  const  groupId  = req.query.groupId;

  if (!groupId) {
      return res.status(400).json({
          message: 'Group ID is required'
      });
  }

  try {
      const group = await Group.findById(groupId).populate('messages.user', 'username'); // Assuming User model has a 'username' field

      if (!group) {
          return res.status(404).json({
              message: 'Group not found'
          });
      }
console.log(group)
      res.status(200).json({
          message: "Successfully fetched group messages",
          group: group // Return the messages array
      });
  } catch (error) {
      console.error("Error fetching group messages:", error);
      res.status(500).json({ message: 'Internal server error' });
  }
};


const fetchgroupdetail = async (req, res) => {
  const groupId = req.query.groupId;

  if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
  }

  try {
      const group = await Group.findById(groupId); // Fetch the group by its ID

      if (!group) {
          return res.status(404).json({ message: 'Group not found' });
      }

      res.json({ group });
  } catch (err) {
      console.error("Error fetching group by ID:", err);
      res.status(500).json({ message: 'Internal server error' });
  }
};


export { registerUser, userData,userDataById, contactData, updateData, userNameData,updateOnlineStatus,creategroup
  ,fetchgroup,searchgroup,joingroup,sendmessageingroup,fetchgroupmessage,fetchgroupdetail
 };
