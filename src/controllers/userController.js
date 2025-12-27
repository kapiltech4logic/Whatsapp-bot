import User from '../models/User.js';
import UserPreference from '../models/UserPreference.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';

// Get all users with pagination and filters
export const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      userType,
      language,
      search,
      sortBy = 'lastActive',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (userType) query.userType = userType;
    if (language) query.language = language;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get or create user by phone number
export const getOrCreateUser = async (req, res) => {
  try {
    const { phoneNumber, name, language } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    let user = await User.findOne({ phoneNumber });

    if (!user) {
      user = await User.create({
        phoneNumber,
        name: name || null,
        language: language || 'en',
        userType: 'NEW',
      });

      // Track registration event
      await AnalyticsEvent.trackEvent({
        userId: user._id,
        eventCategory: 'User',
        eventAction: 'Registration',
        metadata: { source: req.body.source || 'ORGANIC' },
      });
    } else {
      // Update last active
      await user.updateLastActive();
    }

    res.json({ success: true, data: user, isNew: !user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { name, language, userType } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, language, userType },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user preferences
export const getUserPreferences = async (req, res) => {
  try {
    const preferences = await UserPreference.getUserPreferences(req.params.id);

    res.json({ success: true, data: preferences });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Set user preference
export const setUserPreference = async (req, res) => {
  try {
    const { preferenceKey, preferenceValue } = req.body;

    if (!preferenceKey) {
      return res.status(400).json({ success: false, error: 'Preference key is required' });
    }

    const preference = await UserPreference.setPreference(
      req.params.id,
      preferenceKey,
      preferenceValue
    );

    res.json({ success: true, data: preference });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update multiple preferences
export const updateUserPreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ success: false, error: 'Preferences object is required' });
    }

    const results = [];
    for (const [key, value] of Object.entries(preferences)) {
      const pref = await UserPreference.setPreference(req.params.id, key, value);
      results.push(pref);
    }

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user stats
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const usersByType = await User.aggregate([
      { $group: { _id: '$userType', count: { $sum: 1 } } },
    ]);
    const usersByLanguage = await User.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        total: totalUsers,
        byType: usersByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byLanguage: usersByLanguage.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
