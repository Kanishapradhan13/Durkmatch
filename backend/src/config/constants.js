// Bhutan's 20 Dzongkhags (Districts)
const DZONGKHAGS = [
  'Bumthang',
  'Chhukha',
  'Dagana',
  'Gasa',
  'Haa',
  'Lhuntse',
  'Mongar',
  'Paro',
  'Pemagatshel',
  'Punakha',
  'Samdrup Jongkhar',
  'Samtse',
  'Sarpang',
  'Thimphu',
  'Trashigang',
  'Trashiyangtse',
  'Trongsa',
  'Tsirang',
  'Wangdue Phodrang',
  'Zhemgang'
];

const ZODIAC_SIGNS = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Sheep', 'Monkey', 'Rooster', 'Dog', 'Pig'
];

const LANGUAGES = ['English', 'Dzongkha'];

const GENDERS = ['male', 'female', 'other'];

const GENDER_PREFERENCES = ['male', 'female', 'both'];

const MAX_PHOTOS = 6;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

module.exports = {
  DZONGKHAGS,
  ZODIAC_SIGNS,
  LANGUAGES,
  GENDERS,
  GENDER_PREFERENCES,
  MAX_PHOTOS,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES
};
