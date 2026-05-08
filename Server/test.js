import News from "../models/News.js";
import { v2 as cloudinary } from "cloudinary";

// Helper function to get public id from cloudinary image url
const getPublicIdFromUrl = (url) => {
  if (!url) return null;

  try {
    const parts = url.split("/");
    const filename = parts[parts.length - 1].split(".")[0];
    const folder = parts[parts.length - 2];

    return `${folder}/${filename}`;
  } catch (err) {
    return null;
  }
};

// Get all news articles with search, filter and pagination
export const getNews = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    // Search news by title or category
    const keyword = req.query.keyword
      ? {
          $or: [
            { title: { $regex: req.query.keyword, $options: "i" } },
            { category: { $regex: req.query.keyword, $options: "i" } },
          ],
        }
      : {};

    // Filter news by category
    const category =
      req.query.category && req.query.category !== "All"
        ? { category: req.query.category }
        : {};

    // By default show only published news
    let statusFilter = {
      $or: [
        { status: "Published" },
        { status: "Scheduled", scheduleDate: { $lte: new Date() } },
      ],
    };

    // Apply status filter if provided
    if (req.query.status === "Published") {
      statusFilter = {
        $or: [
          { status: "Published" },
          { status: "Scheduled", scheduleDate: { $lte: new Date() } },
        ],
      };
    } else if (req.query.status && req.query.status !== "All") {
      statusFilter = { status: req.query.status };
    }

    // Final query object
    const query = { $and: [statusFilter] };

    if (Object.keys(keyword).length > 0) {
      query.$and.push(keyword);
    }

    if (Object.keys(category).length > 0) {
      query.$and.push(category);
    }

    // Get total count for pagination
    const count = await News.countDocuments(query);

    // Fetch news from database
    const news = await News.find(query)
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      news,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get news for admin dashboard
export const getAdminNews = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    // Search by title or category
    const keyword = req.query.keyword
      ? {
          $or: [
            { title: { $regex: req.query.keyword, $options: "i" } },
            { category: { $regex: req.query.keyword, $options: "i" } },
          ],
        }
      : {};

    // Filter by category
    const category =
      req.query.category && req.query.category !== "All"
        ? { category: req.query.category }
        : {};

    let statusFilter = {};

    // Filter based on news status
    if (req.query.status === "Published") {
      statusFilter = {
        $or: [
          { status: "Published" },
          { status: "Scheduled", scheduleDate: { $lte: new Date() } },
        ],
      };
    } else if (req.query.status === "Scheduled") {
      // Show only future scheduled posts
      statusFilter = {
        status: "Scheduled",
        scheduleDate: { $gt: new Date() },
      };
    } else if (req.query.status && req.query.status !== "All") {
      statusFilter = { status: req.query.status };
    }

    // Writers can only see their own posts
    const userFilter = req.user.role === "writer" ? { user: req.user._id } : {};

    // Merge all filters
    const query = {
      ...keyword,
      ...category,
      ...statusFilter,
      ...userFilter,
    };

    const count = await News.countDocuments(query);

    // Fetch admin news data
    const news = await News.find(query)
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      news,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single news article by id
export const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate(
      "user",
      "firstName lastName",
    );

    if (news) {
      res.json(news);
    } else {
      res.status(404).json({
        message: "News article not found",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new news article
export const createNews = async (req, res) => {
  try {
    const news = new News({
      title: req.body.title || "Untitled Post",
      content: req.body.content || "Content goes here...",
      category: req.body.category || "Politics",
      author: req.body.author || `${req.user.firstName} ${req.user.lastName}`,

      user: req.user._id,
      imageUrl: req.body.imageUrl || "",
      tags: req.body.tags || [],

      // Writers cannot directly publish news
      status:
        req.user.role === "writer" &&
        (req.body.status === "Published" || req.body.status === "Scheduled")
          ? "In-review"
          : req.body.status || "Draft",

      scheduleDate: req.body.scheduleDate || null,
      isBreaking: req.body.isBreaking || false,
    });

    const createdNews = await news.save();

    res.status(201).json(createdNews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update existing news article
export const updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (news) {
      // Writers can only edit their own posts
      if (
        req.user.role === "writer" &&
        news.user?.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          message: "Unauthorized to edit this post",
        });
      }

      // Update fields only if values are provided
      news.title = req.body.title !== undefined ? req.body.title : news.title;

      news.content =
        req.body.content !== undefined ? req.body.content : news.content;

      news.category =
        req.body.category !== undefined ? req.body.category : news.category;

      news.author =
        req.body.author !== undefined ? req.body.author : news.author;

      // Remove old image from cloudinary if new image is uploaded
      if (
        req.body.imageUrl !== undefined &&
        req.body.imageUrl !== news.imageUrl
      ) {
        if (news.imageUrl) {
          const publicId = getPublicIdFromUrl(news.imageUrl);

          if (publicId) {
            cloudinary.uploader
              .destroy(publicId)
              .catch((err) => console.error("Cloudinary cleanup error:", err));
          }
        }

        news.imageUrl = req.body.imageUrl;
      }

      // Update tags
      news.tags = req.body.tags !== undefined ? req.body.tags : news.tags;

      let newStatus =
        req.body.status !== undefined ? req.body.status : news.status;

      // Writers cannot publish directly
      if (
        req.user.role === "writer" &&
        (newStatus === "Published" || newStatus === "Scheduled")
      ) {
        newStatus = "In-review";
      }

      // Save approval time when admin publishes
      if (
        req.user.role === "admin" &&
        newStatus === "Published" &&
        news.status !== "Published"
      ) {
        news.approvedAt = Date.now();
      }

      news.status = newStatus;

      // Update other fields
      news.scheduleDate =
        req.body.scheduleDate !== undefined
          ? req.body.scheduleDate
          : news.scheduleDate;

      news.isBreaking =
        req.body.isBreaking !== undefined
          ? req.body.isBreaking
          : news.isBreaking;

      const updatedNews = await news.save();

      res.json(updatedNews);
    } else {
      res.status(404).json({
        message: "News article not found",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete news article
export const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (news) {
      // Writers can only delete their own posts
      if (
        req.user.role === "writer" &&
        news.user?.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          message: "Unauthorized to delete this post",
        });
      }

      // Delete image from cloudinary
      if (news.imageUrl) {
        const publicId = getPublicIdFromUrl(news.imageUrl);

        if (publicId) {
          cloudinary.uploader
            .destroy(publicId)
            .catch((err) => console.error("Cloudinary deletion error:", err));
        }
      }

      // Remove news document from database
      await News.deleteOne({ _id: news._id });

      res.json({ message: "News removed" });
    } else {
      res.status(404).json({
        message: "News article not found",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
