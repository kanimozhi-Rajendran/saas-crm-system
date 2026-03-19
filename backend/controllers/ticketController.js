const Ticket = require("../models/Ticket");

const createTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

const getTickets = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tickets = await Ticket.find(filter)
      .populate("assignedTo", "name email")
      .populate("customer", "name company")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Ticket.countDocuments(filter);

    res.json({
      success: true,
      data: tickets,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("assignedTo", "name email role")
      .populate("customer", "name company")
      .populate("comments.author", "name");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    ticket.comments.push({
      text: req.body.text,
      author: req.user._id,
    });

    await ticket.save();
    res.json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  addComment,
};