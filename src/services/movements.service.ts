// src/services/movements.service.ts
import { supabaseClient } from '@/lib/supabaseClient';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  created_at: string;
  created_by: string | null;
}

export interface Source {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  created_at: string;
  created_by: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
  created_by: string | null;
}

export interface Movement {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category_id: string | null;
  source_id: string | null;
  project_id: string | null;
  description: string | null;
  created_at: string;
  created_by: string;
}

export interface CreateMovementData {
  type: 'income' | 'expense';
  amount: number;
  category_id: string | null;
  source_id: string | null;
  project_id: string | null;
  description: string | null;
  created_by: string;
}

// ============================================================================
// CATEGORIES
// ============================================================================

/**
 * Obtiene todas las categorías del usuario actual o creadas por él
 * Filtra por tipo: income, expense, o both
 */
export const categoriesService = {
  async getAll(type: 'income' | 'expense'): Promise<Category[]> {
    const { data, error } = await supabaseClient
      .from('categories')
      .select('*')
      .or(`type.eq.${type},type.eq.both`)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Error al cargar las categorías');
    }

    return data || [];
  },

  /**
   * Verifica si una categoría con el mismo nombre ya existe
   */
  async checkDuplicate(name: string): Promise<boolean> {
    const { data, error } = await supabaseClient
      .from('categories')
      .select('id')
      .ilike('name', name)
      .limit(1);

    if (error) {
      console.error('Error checking category duplicate:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  },

  /**
   * Crea una nueva categoría
   */
  async create(
    name: string,
    type: 'income' | 'expense' | 'both',
    userId: string
  ): Promise<Category> {
    // Verificar duplicado
    const isDuplicate = await this.checkDuplicate(name);
    if (isDuplicate) {
      throw new Error('Ya existe una categoría con ese nombre');
    }

    const { data, error } = await supabaseClient
      .from('categories')
      .insert({
        name: name.trim(),
        type,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw new Error('Error al crear la categoría');
    }

    return data;
  },

  /**
   * Busca una categoría por nombre exacto (case-insensitive)
   */
  async findByName(name: string): Promise<Category | null> {
    const { data, error } = await supabaseClient
      .from('categories')
      .select('*')
      .ilike('name', name)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error finding category:', error);
    }

    return data || null;
  },
};

// ============================================================================
// SOURCES
// ============================================================================

export const sourcesService = {
  async getAll(type: 'income' | 'expense'): Promise<Source[]> {
    const { data, error } = await supabaseClient
      .from('sources')
      .select('*')
      .or(`type.eq.${type},type.eq.both`)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching sources:', error);
      throw new Error('Error al cargar las fuentes');
    }

    return data || [];
  },

  async checkDuplicate(name: string): Promise<boolean> {
    const { data, error } = await supabaseClient
      .from('sources')
      .select('id')
      .ilike('name', name)
      .limit(1);

    if (error) {
      console.error('Error checking source duplicate:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  },

  async create(
    name: string,
    type: 'income' | 'expense' | 'both',
    userId: string
  ): Promise<Source> {
    const isDuplicate = await this.checkDuplicate(name);
    if (isDuplicate) {
      throw new Error('Ya existe una fuente con ese nombre');
    }

    const { data, error } = await supabaseClient
      .from('sources')
      .insert({
        name: name.trim(),
        type,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating source:', error);
      throw new Error('Error al crear la fuente');
    }

    return data;
  },

  async findByName(name: string): Promise<Source | null> {
    const { data, error } = await supabaseClient
      .from('sources')
      .select('*')
      .ilike('name', name)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error finding source:', error);
    }

    return data || null;
  },
};

// ============================================================================
// PROJECTS
// ============================================================================

export const projectsService = {
  async getAll(activeOnly = true): Promise<Project[]> {
    let query = supabaseClient.from('projects').select('*');

    if (activeOnly) {
      query = query.eq('active', true);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Error al cargar los proyectos');
    }

    return data || [];
  },

  async checkDuplicate(name: string): Promise<boolean> {
    const { data, error } = await supabaseClient
      .from('projects')
      .select('id')
      .ilike('name', name)
      .limit(1);

    if (error) {
      console.error('Error checking project duplicate:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  },

  async create(name: string, userId: string, description?: string): Promise<Project> {
    const isDuplicate = await this.checkDuplicate(name);
    if (isDuplicate) {
      throw new Error('Ya existe un proyecto con ese nombre');
    }

    const { data, error } = await supabaseClient
      .from('projects')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        active: true,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw new Error('Error al crear el proyecto');
    }

    return data;
  },

  async findByName(name: string): Promise<Project | null> {
    const { data, error } = await supabaseClient
      .from('projects')
      .select('*')
      .ilike('name', name)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error finding project:', error);
    }

    return data || null;
  },
};

// ============================================================================
// MOVEMENTS
// ============================================================================

export const movementsService = {
  /**
   * Crea un nuevo movimiento (ingreso o egreso)
   */
  async create(movementData: CreateMovementData): Promise<Movement> {
    const { data, error } = await supabaseClient
      .from('movements')
      .insert(movementData)
      .select()
      .single();

    if (error) {
      console.error('Error creating movement:', error);
      throw new Error('Error al registrar el movimiento');
    }

    return data;
  },

  /**
   * Obtiene todos los movimientos del usuario actual
   */
  async getAll(userId: string): Promise<Movement[]> {
    const { data, error } = await supabaseClient
      .from('movements')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching movements:', error);
      throw new Error('Error al cargar los movimientos');
    }

    return data || [];
  },

  /**
   * Obtiene un movimiento por ID
   */
  async getById(id: string): Promise<Movement | null> {
    const { data, error } = await supabaseClient
      .from('movements')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching movement:', error);
      return null;
    }

    return data;
  },
};