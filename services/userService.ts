import bcrypt from "bcryptjs";
import fs from "fs";
import jwt from "jsonwebtoken";
import { KEYS, removeCached, setCached, TTL, getCached } from "../cache/userCache.ts";
import { cloudinary } from "../config/cloudinary.ts";
import { dbEcommerce } from "../config/db.ts";
import type { AuthResponse, RegisterDTO, UpdateProfileDTO, User } from "../types/user.ts";

const generateToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" },
  );
};

const register = async (data: RegisterDTO): Promise<AuthResponse> => {
  const { username, email, password } = data;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await dbEcommerce.one(
    "INSERT INTO users(username,email,password) VALUES ($1,$2,$3) RETURNING id, username, email, phone, address, city, avatar",
    [username, email, hashedPassword],
  );

  const token = generateToken(newUser);

  return {
    user: newUser,
    token,
  };
};

const login = async (user: User): Promise<AuthResponse> => {
  const token = generateToken(user);
  await setCached(KEYS.session(user.id), user, TTL.session);

  return {
    user,
    token,
  };
};

const logout = async (userId: string): Promise<void> => {
  await removeCached(KEYS.session(userId));
};

const getProfile = async (id: string): Promise<User | null> => {
  const cached = await getCached(KEYS.userById(id));
  if (cached) return cached;

  const getUser = await dbEcommerce.oneOrNone(
    "SELECT id, email, username, role, phone, address, city, avatar FROM users where id=$1",
    [id],
  );

  if (!getUser) return null;

  await setCached(KEYS.userById(id), getUser, TTL.userById);
  return getUser;
};

const updateProfile = async (data: UpdateProfileDTO): Promise<User> => {
  const { id, email, username, phone, address, city, imageFile } = data;
  let avatar: string | undefined;

  if (imageFile) {
    const result = await cloudinary.uploader.upload(imageFile.path, {
      folder: "easycart/avatars",
    });
    fs.unlinkSync(imageFile.path);
    avatar = result.secure_url;
  }

  let query =
    "UPDATE users SET email=$1, username=$2, phone=$3, address=$4, city=$5 WHERE id=$6 RETURNING id, email, username, phone, address, city, avatar";
  let params = [email, username, phone, address, city, id];

  if (avatar) {
    query =
      "UPDATE users SET email=$1, username=$2, phone=$3, address=$4, city=$5, avatar=$6 WHERE id=$7 RETURNING id, email, username, phone, address, city, avatar";
    params = [email, username, phone, address, city, avatar, id];
  }

  const newProfile = await dbEcommerce.one(query, params);
  await removeCached(KEYS.userById(id));

  return newProfile;
};

export default {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
};
