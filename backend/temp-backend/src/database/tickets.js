import { initializeDatabase } from './setup.js';

class TicketDatabase {
  constructor() {
    this.db = initializeDatabase();
  }

  // Create a new ticket
  create(ticketData) {
    const { name, email, requestType, description, audioBase64, category, priority, summary, entities } = ticketData;
    
    const stmt = this.db.prepare(`
      INSERT INTO tickets (name, email, requestType, description, audioBase64, category, priority, summary, entities)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name,
      email,
      requestType,
      description,
      audioBase64 || null,
      category || null,
      priority || null,
      summary || null,
      entities ? JSON.stringify(entities) : null
    );

    return this.getById(result.lastInsertRowid);
  }

  // Get ticket by ID
  getById(id) {
    const stmt = this.db.prepare('SELECT * FROM tickets WHERE id = ?');
    const ticket = stmt.get(id);
    
    if (ticket && ticket.entities) {
      try {
        ticket.entities = JSON.parse(ticket.entities);
      } catch (e) {
        ticket.entities = null;
      }
    }
    
    return ticket;
  }

  // Get all tickets with optional filters
  getAll(filters = {}) {
    let query = 'SELECT * FROM tickets WHERE 1=1';
    const params = [];

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.priority) {
      query += ' AND priority = ?';
      params.push(filters.priority);
    }

    if (filters.requestType) {
      query += ' AND requestType = ?';
      params.push(filters.requestType);
    }

    if (filters.q) {
      query += ' AND (description LIKE ? OR summary LIKE ? OR name LIKE ?)';
      const searchTerm = `%${filters.q}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY createdAt DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const stmt = this.db.prepare(query);
    const tickets = stmt.all(...params);

    return tickets.map(ticket => {
      if (ticket.entities) {
        try {
          ticket.entities = JSON.parse(ticket.entities);
        } catch (e) {
          ticket.entities = null;
        }
      }
      return ticket;
    });
  }

  // Update ticket
  update(id, updateData) {
    const fields = [];
    const params = [];

    Object.entries(updateData).forEach(([key, value]) => {
      if (key === 'entities' && value) {
        fields.push(`${key} = ?`);
        params.push(JSON.stringify(value));
      } else if (value !== undefined) {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    });

    if (fields.length === 0) {
      return this.getById(id);
    }

    const query = `UPDATE tickets SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);

    const stmt = this.db.prepare(query);
    stmt.run(...params);

    return this.getById(id);
  }

  // Delete ticket
  delete(id) {
    const stmt = this.db.prepare('DELETE FROM tickets WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Get statistics
  getStats() {
    const totalStmt = this.db.prepare('SELECT COUNT(*) as total FROM tickets');
    const categoryStmt = this.db.prepare('SELECT category, COUNT(*) as count FROM tickets WHERE category IS NOT NULL GROUP BY category');
    const priorityStmt = this.db.prepare('SELECT priority, COUNT(*) as count FROM tickets WHERE priority IS NOT NULL GROUP BY priority');

    return {
      total: totalStmt.get().total,
      byCategory: categoryStmt.all(),
      byPriority: priorityStmt.all()
    };
  }

  // Close database connection
  close() {
    this.db.close();
  }
}

export default TicketDatabase;