const axios = require('axios');
const crypto = require('crypto');

// Filipino Names Database
const filipinoFirstNames = [
  "Jake", "John", "Mark", "Michael", "Ryan", "Arvin", "Kevin", "Ian", "Carlo", "Jeffrey",
  "Joshua", "Bryan", "Jericho", "Christian", "Vincent", "Angelo", "Francis", "Patrick",
  "Emmanuel", "Gerald", "Marvin", "Ronald", "Albert", "Roderick", "Raymart", "Jay-ar",
  "Maria", "Ana", "Lisa", "Jennifer", "Christine", "Catherine", "Jocelyn", "Marilyn",
  "Angel", "Princess", "Mary Joy", "Rose Ann", "Liezl", "Aileen", "Darlene", "Shiela"
];

const filipinoSurnames = [
  "Dela Cruz", "Santos", "Reyes", "Garcia", "Mendoza", "Flores", "Gonzales", "Lopez",
  "Cruz", "Perez", "Fernandez", "Villanueva", "Ramos", "Aquino", "Castro", "Rivera",
  "Bautista", "Martinez", "De Guzman", "Francisco", "Alvarez", "Domingo", "Mercado",
  "Torres", "Gutierrez", "Ramirez", "Delos Santos", "Tolentino", "Javier", "Hernandez"
];

class FacebookCreator {
  constructor() {
    this.api_key = "882a8490361da98702bf97a021ddc14d";
    this.secret = "62f8ce9f74b12f84c123cc23437a4a32";
  }

  generateRandomString(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  generateRandomPassword(length = 12) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  getRandomDate(start = new Date(1976, 0, 1), end = new Date(2004, 0, 1)) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  getRandomName() {
    return {
      firstName: filipinoFirstNames[Math.floor(Math.random() * filipinoFirstNames.length)],
      lastName: filipinoSurnames[Math.floor(Math.random() * filipinoSurnames.length)]
    };
  }

  async createAccount(options = {}) {
    try {
      const {
        firstName = this.getRandomName().firstName,
        lastName = this.getRandomName().lastName,
        email,
        password = this.generateRandomPassword(12),
        gender = Math.random() < 0.5 ? "M" : "F",
        birthday = this.getRandomDate()
      } = options;

      if (!email) {
        throw new Error('Email is required');
      }

      const birthYear = birthday.getFullYear();
      const birthMonth = String(birthday.getMonth() + 1).padStart(2, '0');
      const birthDay = String(birthday.getDate()).padStart(2, '0');
      const formattedBirthday = `${birthYear}-${birthMonth}-${birthDay}`;

      const req = {
        api_key: this.api_key,
        attempt_login: true,
        birthday: formattedBirthday,
        client_country_code: "EN",
        fb_api_caller_class: "com.facebook.registration.protocol.RegisterAccountMethod",
        fb_api_req_friendly_name: "registerAccount",
        firstname: firstName,
        format: "json",
        gender: gender,
        lastname: lastName,
        email: email,
        locale: "en_US",
        method: "user.register",
        password: password,
        reg_instance: this.generateRandomString(32),
        return_multiple_errors: true
      };

      // Generate signature
      const sigString = Object.keys(req)
        .sort()
        .map(key => `${key}=${req[key]}`)
        .join('') + this.secret;
      
      req.sig = crypto.createHash('md5').update(sigString).digest('hex');

      const response = await axios.post("https://b-api.facebook.com/method/user.register", 
        new URLSearchParams(req), {
        headers: {
          "User-Agent": "[FBAN/FB4A;FBAV/35.0.0.48.273;FBDM/{density=1.33125,width=800,height=1205};FBLC/en_US;FBCR/;FBPN/com.facebook.katana;FBDV/Nexus 7;FBSV/4.1.1;FBBK/0;]",
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "*/*",
          "Accept-Language": "en-US",
          "Connection": "keep-alive"
        },
        timeout: 30000
      });

      if (response.data && !response.data.error) {
        const userId = response.data.new_user_id || response.data.uid || response.data.id || this.generateRandomString(14);
        
        return {
          success: true,
          account: {
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
            birthday: formattedBirthday,
            userId: userId,
            profileLink: `https://facebook.com/profile.php?id=${userId}`,
            gender: gender
          },
          raw: response.data
        };
      } else {
        return {
          success: false,
          error: response.data.error_msg || response.data.error || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Facebook creation error:', error.message);
      return {
        success: false,
        error: error.response?.data?.error_msg || error.message
      };
    }
  }
}

module.exports = new FacebookCreator();
