// login for employee and admin

import userModel from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// POST: /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await userModel.findOne({ email });
    // Debug logs (temporary)
    console.log("[authController] login attempt for:", email);
    console.log(
      "[authController] found user:",
      user
        ? {
            email: user.email,
            role: user.role,
            pwHashPrefix: user.password
              ? String(user.password).slice(0, 10)
              : null,
          }
        : null,
    );
    // More debug: types and lengths (temporary)
    console.log(
      "[authController] provided password length:",
      password ? String(password).length : 0,
    );
    console.log(
      "[authController] stored password type/length:",
      user && user.password ? typeof user.password : null,
      user && user.password ? String(user.password).length : null,
    );
    console.log(
      "[authController] stored password looks like bcrypt:",
      user && user.password && typeof user.password === "string"
        ? String(user.password).startsWith("$2")
        : false,
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isMatched = await bcrypt.compare(password, user.password);
    console.log("[authController] bcrypt.compare result:", isMatched);

    if (!isMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // JWT Payload
    const payload = {
      id: user._id,
      role: user.role,
    };

    // Generate Token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set HttpOnly SameSite‑Strict cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = (req, res) => {
  // Clear the HttpOnly cookie
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  return res.status(200).json({ success: true, message: "Logged out" });
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be atleast 8 char",
      });
    }

    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatched = await bcrypt.compare(currentPassword, user.password);

    if (!isMatched) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
