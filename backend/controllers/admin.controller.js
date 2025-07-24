import { User } from "../models/user.model.js";
import { sendEmail } from '../utils/sendEmail.js';
import { clearUserSession } from '../utils/generateTokenAndSetCookie.js';

// 1. Get all pending volunteers
export const getPendingVolunteers = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user || user.category !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  try {
    const volunteers = await User.find({ category: 'Volunteer', isApproved: false });
    res.status(200).json({ success: true, volunteers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 2. Approve a volunteer
export const approveVolunteer = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user || user.category !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  try {
    const { id } = req.params;
    const volunteer = await User.findOneAndUpdate(
      { _id: id, category: 'Volunteer' },
      { isApproved: true },
      { new: true }
    );
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    // Send approval email
    await sendEmail({
      to: volunteer.email,
      subject: 'Your Volunteer Account has been Approved!',
      html: `<p>Hello ${volunteer.name},</p>
             <p>Your volunteer account for SCAN has been approved by an administrator.</p>
             <p>You can now log in to your account and start helping.</p>
             <p>
               <a href="${process.env.CLIENT_URL}/login" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Log In to SCAN</a>
             </p>
             <p>Thank you for joining our community!</p>`
    });

    res.status(200).json({ success: true, volunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 3. Reject (delete) a volunteer
export const rejectVolunteer = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user || user.category !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  try {
    const { id } = req.params;
    const volunteer = await User.findOneAndDelete({ _id: id, category: 'Volunteer' });
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    // Clear user session
    await clearUserSession(id);

    // Send account termination email
    await sendEmail({
      to: volunteer.email,
      subject: 'Your Volunteer Account Request Has Been Rejected',
      html: `<p>Hello ${volunteer.name},</p>
             <p>Your volunteer account request on SCAN has been rejected by an administrator.</p>
             <p>If you believe this was a mistake, please contact support at scanserviceandhelp@gmail.com</p>
             <p>Thank you for your understanding.</p>`
    });

    res.status(200).json({ success: true, message: 'Volunteer deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 4. Get all users (volunteers or citizens)
export const getAllUsers = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user || user.category !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  try {
    const { role } = req.query;
    if (!role || (role !== 'Volunteer' && role !== 'Citizen')) {
      return res.status(400).json({ success: false, message: 'Role query param required (Volunteer or Citizen)' });
    }
    // Only fetch verified (i.e., not banned) users
    const users = await User.find({ category: role, isVerified: true });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 5. Delete a user
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user || user.category !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  try {
    const { id } = req.params;
    const userToDelete = await User.findByIdAndDelete(id);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Clear user session
    await clearUserSession(id);

    // Send account termination email
    await sendEmail({
      to: userToDelete.email,
      subject: 'Your SCAN Account Has Been Terminated',
      html: `<p>Hello ${userToDelete.name},</p>
             <p>Your account on SCAN has been terminated by an administrator.</p>
             <p>If you would like to use our services again, you will need to sign up for a new account.</p>
             <p>If you believe this was a mistake, please contact support at scanserviceandhelp@gmail.com</p>
             <p>Thank you for your understanding.</p>`
    });

    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 6. Get all help requests
export const getAllHelps = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user || user.category !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  try {
    // Find all users (citizens) with an active or in-progress help request
    const helps = await User.find({
      category: 'Citizen',
      helptitle: { $ne: null }
    });
    res.status(200).json({ success: true, helps });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 7. Mark help as completed
export const completeHelp = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user || user.category !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  try {
    const { id } = req.params;
    const userToUpdate = await User.findById(id);
    if (!userToUpdate || userToUpdate.category !== 'Citizen') {
      return res.status(404).json({ success: false, message: 'Help request not found' });
    }
    
    // Call the markHelpCompleted function with admin privileges
    const { markHelpCompleted } = await import('../controllers/auth.controller.js');
    await markHelpCompleted({
      body: { 
        email: userToUpdate.email, 
        isAdmin: true 
      }
    }, res);
    
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 8. Cancel help
export const cancelHelp = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user || user.category !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  try {
    const { id } = req.params;
    const userToUpdate = await User.findById(id);
    if (!userToUpdate || userToUpdate.category !== 'Citizen') {
      return res.status(404).json({ success: false, message: 'Help request not found' });
    }
    userToUpdate.helptitle = null;
    userToUpdate.helpdescription = null;
    userToUpdate.additional = null;
    userToUpdate.location = null;
    userToUpdate.helpstatus = true;
    userToUpdate.volunteerDetails = {};
    await userToUpdate.save();
    res.status(200).json({ success: true, message: 'Help cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 9. Ban a user
export const banUser = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user || user.category !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  try {
    const { id } = req.params;
    const userToBan = await User.findById(id);
    if (!userToBan) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Banning sets verified to false and approved to true (to remove from pending)
    userToBan.isVerified = false;
    userToBan.isApproved = true; 
    await userToBan.save();

    // Clear user session
    await clearUserSession(id);

    // Send ban email
    await sendEmail({
      to: userToBan.email,
      subject: 'Your SCAN Account Has Been Suspended',
      html: `<p>Hello ${userToBan.name},</p>
             <p>Your account on SCAN has been suspended by an administrator. You will not be able to log in until further notice.</p>
             <p>If you believe this was a mistake, please contact support at scanserviceandhelp@gmail.com</p>`
    });

    res.status(200).json({ success: true, message: 'User has been banned' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 10. Unban a user
export const unbanUser = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user || user.category !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  try {
    const { id } = req.params;
    const userToUnban = await User.findById(id);
    if (!userToUnban) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    userToUnban.isVerified = true;
    await userToUnban.save();

    // Send unban email
    await sendEmail({
      to: userToUnban.email,
      subject: 'Your SCAN Account Has Been Restored',
      html: `<p>Hello ${userToUnban.name},</p>
             <p>Your account on SCAN has been restored by an administrator. You can now log in and use the platform again.</p>
             <p>
               <a href="${process.env.CLIENT_URL}/login" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Log In to SCAN</a>
             </p>
             <p>Thank you for your patience.</p>`
    });

    res.status(200).json({ success: true, message: 'User has been unbanned' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 11. Get all banned users
export const getBannedUsers = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user || user.category !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  try {
    const { category, search } = req.query;
    let query = { isVerified: false };

    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    const users = await User.find(query);
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}; 