import { 
  users, type User, type InsertUser,
  professionals, type Professional, type InsertProfessional,
  timeSlots, type TimeSlot, type InsertTimeSlot,
  schedules, type Schedule, type InsertSchedule,
  activityTypeTable, type ActivityType, type InsertActivityType,
  defaultActivityTypes,
  type WeekDay
} from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and } from "drizzle-orm";
import { pool } from './db';
import { log } from './vite';

// Interface de armazenamento
export interface IStorage {
  // Profissionais
  getAllProfessionals(): Promise<Professional[]>;
  getProfessional(id: number): Promise<Professional | undefined>;
  createProfessional(professional: InsertProfessional): Promise<Professional>;
  updateProfessional(id: number, data: Partial<InsertProfessional>): Promise<Professional | undefined>;
  deleteProfessional(id: number): Promise<boolean>;
  
  // Tipos de Atividades
  getAllActivityTypes(): Promise<ActivityType[]>;
  getActivityType(id: number): Promise<ActivityType | undefined>;
  getActivityTypeByCode(code: string): Promise<ActivityType | undefined>;
  createActivityType(activityType: InsertActivityType): Promise<ActivityType>;
  updateActivityType(id: number, data: Partial<InsertActivityType>): Promise<ActivityType | undefined>;
  deleteActivityType(id: number): Promise<boolean>;
  
  // Horários
  getAllTimeSlots(): Promise<TimeSlot[]>;
  getBaseTimeSlots(): Promise<TimeSlot[]>;
  getTimeSlot(id: number): Promise<TimeSlot | undefined>;
  createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot>;
  deleteTimeSlot(id: number): Promise<boolean>;
  
  // Escalas
  getSchedulesByDay(weekday: WeekDay): Promise<Schedule[]>;
  getSchedulesByProfessional(professionalId: number): Promise<Schedule[]>;
  getSchedule(id: number): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, data: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  deleteSchedule(id: number): Promise<boolean>;
}

// Implementação do storage usando PostgreSQL
class PostgresStorage implements IStorage {
  private db;

  constructor() {
    this.db = drizzle(pool, { schema: { 
      users, 
      professionals, 
      timeSlots, 
      schedules, 
      activityTypes: activityTypeTable 
    }});
    log('[DEBUG] PostgresStorage inicializado');
  }

  // Profissionais
  async getAllProfessionals(): Promise<Professional[]> {
    try {
      log('[DEBUG] Buscando todos os profissionais');
      const result = await this.db.select().from(professionals);
      log('[DEBUG] Profissionais encontrados: ' + String(result.length));
      return result;
    } catch (error) {
      log('[ERROR] Erro ao buscar profissionais:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  async getProfessional(id: number): Promise<Professional | undefined> {
    try {
      const [result] = await this.db.select().from(professionals).where(eq(professionals.id, id));
      return result;
    } catch (error) {
      log('[ERROR] Erro ao buscar profissional:', error instanceof Error ? error.message : String(error));
      return undefined;
    }
  }

  async createProfessional(data: InsertProfessional): Promise<Professional> {
    try {
      const [result] = await this.db.insert(professionals).values(data).returning();
      return result;
    } catch (error) {
      log('[ERROR] Erro ao criar profissional:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async updateProfessional(id: number, data: Partial<InsertProfessional>): Promise<Professional | undefined> {
    try {
      const [result] = await this.db.update(professionals).set(data).where(eq(professionals.id, id)).returning();
      return result;
    } catch (error) {
      log('[ERROR] Erro ao atualizar profissional:', error instanceof Error ? error.message : String(error));
      return undefined;
    }
  }

  async deleteProfessional(id: number): Promise<boolean> {
    try {
      const result = await this.db.delete(professionals).where(eq(professionals.id, id));
      return true;
    } catch (error) {
      log('[ERROR] Erro ao deletar profissional:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  // Tipos de Atividades
  async getAllActivityTypes(): Promise<ActivityType[]> {
    try {
      log('[DEBUG] Buscando todos os tipos de atividades');
      const result = await this.db.select().from(activityTypeTable);
      log('[DEBUG] Tipos de atividades encontrados: ' + String(result.length));
      return result;
    } catch (error) {
      log('[ERROR] Erro ao buscar tipos de atividades:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  async getActivityType(id: number): Promise<ActivityType | undefined> {
    try {
      const [result] = await this.db.select().from(activityTypeTable).where(eq(activityTypeTable.id, id));
      return result;
    } catch (error) {
      log('[ERROR] Erro ao buscar tipo de atividade:', error instanceof Error ? error.message : String(error));
      return undefined;
    }
  }

  async getActivityTypeByCode(code: string): Promise<ActivityType | undefined> {
    try {
      const [result] = await this.db.select().from(activityTypeTable).where(eq(activityTypeTable.code, code));
      return result;
    } catch (error) {
      log('[ERROR] Erro ao buscar tipo de atividade por código:', error instanceof Error ? error.message : String(error));
      return undefined;
    }
  }

  async createActivityType(data: InsertActivityType): Promise<ActivityType> {
    try {
      const [result] = await this.db.insert(activityTypeTable).values(data).returning();
      return result;
    } catch (error) {
      log('[ERROR] Erro ao criar tipo de atividade:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async updateActivityType(id: number, data: Partial<InsertActivityType>): Promise<ActivityType | undefined> {
    try {
      const [result] = await this.db.update(activityTypeTable).set(data).where(eq(activityTypeTable.id, id)).returning();
      return result;
    } catch (error) {
      log('[ERROR] Erro ao atualizar tipo de atividade:', error instanceof Error ? error.message : String(error));
      return undefined;
    }
  }

  async deleteActivityType(id: number): Promise<boolean> {
    try {
      await this.db.delete(activityTypeTable).where(eq(activityTypeTable.id, id));
      return true;
    } catch (error) {
      log('[ERROR] Erro ao deletar tipo de atividade:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  // Horários
  async getAllTimeSlots(): Promise<TimeSlot[]> {
    try {
      const result = await this.db.select().from(timeSlots);
      return result;
    } catch (error) {
      log('[ERROR] Erro ao buscar horários:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  async getBaseTimeSlots(): Promise<TimeSlot[]> {
    try {
      const result = await this.db.select().from(timeSlots).where(eq(timeSlots.isBaseSlot, 1));
      return result;
    } catch (error) {
      log('[ERROR] Erro ao buscar horários base:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  async getTimeSlot(id: number): Promise<TimeSlot | undefined> {
    try {
      const [result] = await this.db.select().from(timeSlots).where(eq(timeSlots.id, id));
      return result;
    } catch (error) {
      log('[ERROR] Erro ao buscar horário:', error instanceof Error ? error.message : String(error));
      return undefined;
    }
  }

  async createTimeSlot(data: InsertTimeSlot): Promise<TimeSlot> {
    try {
      const [result] = await this.db.insert(timeSlots).values(data).returning();
      return result;
    } catch (error) {
      log('[ERROR] Erro ao criar horário:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async deleteTimeSlot(id: number): Promise<boolean> {
    try {
      await this.db.delete(timeSlots).where(eq(timeSlots.id, id));
      return true;
    } catch (error) {
      log('[ERROR] Erro ao deletar horário:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  // Escalas
  async getSchedulesByDay(weekday: WeekDay): Promise<Schedule[]> {
    try {
      log(`[DEBUG] Buscando escalas para ${weekday}`);
      const result = await this.db.select().from(schedules).where(eq(schedules.weekday, weekday));
      log(`[DEBUG] Encontradas ${result.length} escalas para ${weekday}`);
      return result;
    } catch (error) {
      log('[ERROR] Erro ao buscar escalas por dia:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  async getSchedulesByProfessional(professionalId: number): Promise<Schedule[]> {
    try {
      const result = await this.db.select().from(schedules).where(eq(schedules.professionalId, professionalId));
      return result;
    } catch (error) {
      log('[ERROR] Erro ao buscar escalas por profissional:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  async getSchedule(id: number): Promise<Schedule | undefined> {
    try {
      const [result] = await this.db.select().from(schedules).where(eq(schedules.id, id));
      return result;
    } catch (error) {
      log('[ERROR] Erro ao buscar escala:', error instanceof Error ? error.message : String(error));
      return undefined;
    }
  }

  async createSchedule(data: InsertSchedule): Promise<Schedule> {
    try {
      const [result] = await this.db.insert(schedules).values(data).returning();
      return result;
    } catch (error) {
      log('[ERROR] Erro ao criar escala:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async updateSchedule(id: number, data: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    try {
      const [result] = await this.db.update(schedules).set(data).where(eq(schedules.id, id)).returning();
      return result;
    } catch (error) {
      log('[ERROR] Erro ao atualizar escala:', error instanceof Error ? error.message : String(error));
      return undefined;
    }
  }

  async deleteSchedule(id: number): Promise<boolean> {
    try {
      await this.db.delete(schedules).where(eq(schedules.id, id));
      return true;
    } catch (error) {
      log('[ERROR] Erro ao deletar escala:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }
}

// Exporta a instância do storage
export const storage = new PostgresStorage();
