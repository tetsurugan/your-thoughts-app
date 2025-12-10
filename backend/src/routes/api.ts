import express from 'express';
import * as taskController from '../controllers/taskController';
import * as documentController from '../controllers/documentController';
import * as intentController from '../controllers/intentController';
import * as calendarController from '../controllers/calendarController';
import * as notificationController from '../controllers/notificationController';
import * as authController from '../controllers/authController';
import * as tagController from '../controllers/tagController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Auth
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.post('/auth/guest', authController.loginAsGuest);
router.get('/auth/me', authenticateToken, authController.getMe);
router.patch('/auth/profile', authenticateToken, authController.updateProfile);
router.patch('/auth/password', authenticateToken, authController.updatePassword);
router.delete('/auth/account', authenticateToken, authController.deleteAccount);

// Tasks (Protected)
router.get('/tasks', authenticateToken, taskController.getTasks);
router.post('/tasks', authenticateToken, taskController.createTask);
router.patch('/tasks/:id', authenticateToken, taskController.updateTask);
router.delete('/tasks/:id', authenticateToken, taskController.deleteTask);
router.post('/tasks/:id/breakdown', authenticateToken, taskController.generateBreakdown);
router.patch('/subtasks/:id', authenticateToken, taskController.toggleSubtask);

// Tags (Protected)
router.get('/tags', authenticateToken, tagController.getTags);
router.post('/tags', authenticateToken, tagController.createTag);
router.delete('/tags/:id', authenticateToken, tagController.deleteTag);

// Specialized
router.post('/intent', authenticateToken, intentController.processIntent);

// Documents (Protected)
router.post('/documents', authenticateToken, documentController.createDocument);
router.post('/documents/:id/parse', authenticateToken, documentController.parseDocument);

// Calendar (Protected)
router.get('/calendar/google/connect', authenticateToken, calendarController.connectGoogle);
router.get('/calendar/google/callback', calendarController.googleCallback);
router.post('/calendar/events', authenticateToken, calendarController.createEvent);
router.delete('/calendar/events/:taskId', authenticateToken, calendarController.deleteEvent);

// Notifications (Protected)
router.post('/notifications/subscribe', authenticateToken, notificationController.subscribeUser);
router.post('/notifications/test', authenticateToken, notificationController.testNotification);

export default router;
