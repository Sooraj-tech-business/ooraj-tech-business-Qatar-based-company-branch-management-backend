const Employee = require('../models/Employee');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { logActivity } = require('./activityController');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
const getEmployees = asyncHandler(async (req, res) => {
  console.log('Getting all employees');
  
  try {
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees`);
    
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching employees',
      error: error.message
    });
  }
});

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  
  if (employee) {
    res.json(employee);
  } else {
    res.status(404);
    throw new Error('Employee not found');
  }
});

// @desc    Add a new employee
// @route   POST /api/employees
// @access  Private
const addEmployee = asyncHandler(async (req, res) => {
  console.log('Request body:', req.body);
  
  const { 
    name, email, role, branch, designation, doj, qid, 
    passportNumber, workLocation, status, bankName, bankAccountNumber,
    emergencyContact, emergencyContact2, nativeAddress, 
    medicalCardNumber, medicalCardExpiry, visaNumber, visaExpiry, password,
    documents, qidExpiry, passportExpiry, doe, phone, nationality, salary, visaAddedBranch
  } = req.body;

  if (!name || !email || !role) {
    res.status(400);
    throw new Error('Please provide all required fields (name, email, role, branch)');
  }

  // Check if employee already exists
  const employeeExists = await Employee.findOne({ email });
  if (employeeExists) {
    // Update existing employee with new data including documents
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeExists._id,
      {
        name,
        role,
        branch,
        designation,
        doj,
        doe,
        qid,
        qidExpiry,
        passportNumber,
        passportExpiry,
        workLocation,
        status: status || 'Working',
        bankName,
        bankAccountNumber,
        emergencyContact,
        emergencyContact2,
        nativeAddress,
        medicalCardNumber,
        medicalCardExpiry,
        visaNumber,
        visaExpiry,
        phone,
        nationality,
        salary,
        visaAddedBranch,
        documents: documents || employeeExists.documents || {}
      },
      { new: true }
    );
    
    console.log('Employee updated:', updatedEmployee);
    
    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
  }
  try {
    const employee = await Employee.create({
      name,
      email,
      role,
      branch,
      designation,
      doj,
      doe,
      qid,
      qidExpiry,
      passportNumber,
      passportExpiry,
      workLocation,
      status: status || 'Working',
      bankName,
      bankAccountNumber,
      emergencyContact,
      emergencyContact2,
      nativeAddress,
      medicalCardNumber,
      medicalCardExpiry,
      visaNumber,
      visaExpiry,
      phone,
      nationality,
      salary,
      visaAddedBranch,
      documents: documents || {}
    });
    
    console.log('Employee created:', employee);
    
    // Log activity
    await logActivity({
      type: 'employee_created',
      description: `Employee ${name} was created`,
      entityId: employee._id,
      entityName: name,
      entityType: 'employee'
    });

    if (employee) {
      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        employee: employee
      });
    } else {
      res.status(400);
      throw new Error('Invalid employee data');
    }
  } catch (error) {
    console.error('Error creating employee:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      
      let message = '';
      if (field === 'email') {
        message = `Email '${value}' is already registered. Please use a different email address.`;
      } else if (field === 'phone') {
        message = `Phone number '${value}' is already registered. Please use a different phone number.`;
      } else {
        message = `${field} '${value}' already exists. Please use a different value.`;
      }
      
      return res.status(400).json({
        success: false,
        message: message
      });
    }
    
    res.status(400).json({
      success: false,
      message: `Failed to create employee: ${error.message}`
    });
  }
});

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
const updateEmployee = asyncHandler(async (req, res) => {
  // Check if ID is valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid employee ID format');
  }
  
  const employee = await Employee.findById(req.params.id);
  
  if (employee) {
    employee.name = req.body.name || employee.name;
    employee.email = req.body.email || employee.email;
    employee.role = req.body.role || employee.role;
    employee.branch = req.body.branch || employee.branch;
    employee.designation = req.body.designation || employee.designation;
    employee.doj = req.body.doj || employee.doj;
    employee.doe = req.body.doe || employee.doe;
    employee.qid = req.body.qid || employee.qid;
    employee.passportNumber = req.body.passportNumber || employee.passportNumber;
    employee.workLocation = req.body.workLocation || employee.workLocation;
    employee.status = req.body.status || employee.status;
    employee.bankName = req.body.bankName || employee.bankName;
    employee.bankAccountNumber = req.body.bankAccountNumber || employee.bankAccountNumber;
    employee.emergencyContact = req.body.emergencyContact || employee.emergencyContact;
    employee.emergencyContact2 = req.body.emergencyContact2 || employee.emergencyContact2;
    employee.nativeAddress = req.body.nativeAddress || employee.nativeAddress;
    employee.medicalCardNumber = req.body.medicalCardNumber || employee.medicalCardNumber;
    employee.medicalCardExpiry = req.body.medicalCardExpiry || employee.medicalCardExpiry;
    employee.visaNumber = req.body.visaNumber || employee.visaNumber;
    employee.visaExpiry = req.body.visaExpiry || employee.visaExpiry;
    employee.qidExpiry = req.body.qidExpiry || employee.qidExpiry;
    employee.passportExpiry = req.body.passportExpiry || employee.passportExpiry;
    employee.phone = req.body.phone || employee.phone;
    employee.nationality = req.body.nationality || employee.nationality;
    employee.salary = req.body.salary || employee.salary;
    employee.visaAddedBranch = req.body.visaAddedBranch || employee.visaAddedBranch;
    
    // Update documents if provided
    console.log('Documents in request body:', req.body.documents);
    if (req.body.documents) {
      // Initialize documents if it doesn't exist
      if (!employee.documents) {
        employee.documents = {};
      }
      
      console.log('Existing employee documents:', employee.documents);
      
      // Update each document type individually to preserve existing data
      Object.keys(req.body.documents).forEach(docType => {
        if (req.body.documents[docType]) {
          console.log(`Updating ${docType}:`, req.body.documents[docType]);
          employee.documents[docType] = req.body.documents[docType];
        }
      });
      
      // Mark the documents field as modified for Mongoose
      employee.markModified('documents');
      console.log('Updated employee documents:', employee.documents);
    }
    
    try {
      const updatedEmployee = await employee.save();
      
      // Log activity
      await logActivity({
        type: 'employee_updated',
        description: `Employee ${updatedEmployee.name} was updated`,
        entityId: updatedEmployee._id,
        entityName: updatedEmployee.name,
        entityType: 'employee'
      });
      
      res.json(updatedEmployee);
    } catch (error) {
      // Handle duplicate key errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        const value = error.keyValue[field];
        
        let message = '';
        if (field === 'email') {
          message = `Email '${value}' is already registered. Please use a different email address.`;
        } else if (field === 'phone') {
          message = `Phone number '${value}' is already registered. Please use a different phone number.`;
        } else {
          message = `${field} '${value}' already exists. Please use a different value.`;
        }
        
        return res.status(400).json({
          success: false,
          message: message
        });
      }
      
      res.status(400).json({
        success: false,
        message: `Failed to update employee: ${error.message}`
      });
    }
  } else {
    res.status(404);
    throw new Error('Employee not found');
  }
});

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private
const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  
  if (employee) {
    const employeeName = employee.name;
    const employeeId = employee._id;
    
    await Employee.findByIdAndDelete(employee._id);
    
    // Log activity
    await logActivity({
      type: 'employee_deleted',
      description: `Employee ${employeeName} was deleted`,
      entityId: employeeId,
      entityName: employeeName,
      entityType: 'employee'
    });
    
    res.json({ message: 'Employee removed' });
  } else {
    res.status(404);
    throw new Error('Employee not found');
  }
});

module.exports = {
  getEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee
};