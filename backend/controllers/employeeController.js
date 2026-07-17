import userModel from "../models/user.js";
import bcrypt from "bcrypt";
// 1.Get all employees:

// GET: /api/employees
const getEmployees = async (req, res) => {
  try {
    const employees = await userModel
      .find({ role: "EMPLOYEE" })
      .select("-password");
    return res.status(200).json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//2.Create employee:
// POST: /api/employees
const createEmployees = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Credentials!" });
    }
    const exisiting = await userModel.findOne({ email });
    if (exisiting) {
      return res
        .status(400)
        .json({ success: false, message: "User Already Exists!" });
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address." });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be atleast 8 char" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: "EMPLOYEE",
    });
    return res
      .status(201)
      .json({ success: true, message: "User created Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3.update empl
// PUT: /api/employee/:id
const updateEmployee = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { id } = req.params;

    const updateData = {
      name,
      email,
    };

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be atleast 8 char",
        });
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const employee = await userModel
      .findOneAndUpdate({ _id: id, role: "EMPLOYEE" }, updateData, {
        new: true,
      })
      .select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4.Delete employee
// DELETE: /api/employee/:id
const deleteEmployee = async (req, res) => {
  try {
    const employee = await userModel.findOneAndDelete({
      _id: req.params.id,
      role: "EMPLOYEE",
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { createEmployees, getEmployees, updateEmployee, deleteEmployee };
