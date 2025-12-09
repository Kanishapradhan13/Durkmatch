const { body, validationResult } = require('express-validator');
const { DZONGKHAGS, GENDERS, GENDER_PREFERENCES, LANGUAGES, ZODIAC_SIGNS } = require('../config/constants');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('age')
    .isInt({ min: 18, max: 100 })
    .withMessage('Age must be between 18 and 100'),
  body('gender')
    .isIn(GENDERS)
    .withMessage(`Gender must be one of: ${GENDERS.join(', ')}`),
  body('dzongkhag')
    .isIn(DZONGKHAGS)
    .withMessage('Invalid dzongkhag'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be max 500 characters'),
  validate
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const profileUpdateValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('age').optional().isInt({ min: 18, max: 100 }),
  body('gender').optional().isIn(GENDERS),
  body('dzongkhag').optional().isIn(DZONGKHAGS),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('education').optional().trim().isLength({ max: 255 }),
  body('occupation').optional().trim().isLength({ max: 255 }),
  body('preferred_language').optional().isIn(LANGUAGES),
  body('zodiac_sign').optional().isIn(ZODIAC_SIGNS),
  body('preferred_gender').optional().isIn(GENDER_PREFERENCES),
  body('min_age').optional().isInt({ min: 18, max: 100 }),
  body('max_age').optional().isInt({ min: 18, max: 100 }),
  body('interests').optional().isArray(),
  body('preferred_dzongkhags').optional().isArray(),
  validate
];

const swipeValidation = [
  body('targetUserId').isInt().withMessage('Valid target user ID is required'),
  body('swipeType')
    .isIn(['like', 'pass'])
    .withMessage('Swipe type must be like or pass'),
  validate
];

const messageValidation = [
  body('matchId').isInt().withMessage('Valid match ID is required'),
  body('messageText')
    .trim()
    .notEmpty()
    .withMessage('Message cannot be empty')
    .isLength({ max: 1000 })
    .withMessage('Message must be max 1000 characters'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  profileUpdateValidation,
  swipeValidation,
  messageValidation
};
