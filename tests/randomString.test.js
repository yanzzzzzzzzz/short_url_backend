const { generateRandomString } = require('../utils/randomString');

describe('generateRandomString', () => {
  test('should generate a string with length 6', () => {
    const result = generateRandomString();
    expect(result).toHaveLength(6);
  });

  test('should only contain characters from the specified character set', () => {
    const result = generateRandomString();
    const validCharacters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < result.length; i++) {
      expect(validCharacters.includes(result[i])).toBe(true);
    }
  });
});
