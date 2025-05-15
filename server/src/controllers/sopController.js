import supabase from '../config/database.js';

export const createSop = async (req, res) => {
  const { name, content } = req.body;
  if (!name || !content) {
    return res.status(400).json({ error: 'Name and content are required' });
  }

  try {
    const { data, error } = await supabase
      .from('sops')
      .insert([{ name, content, user_id: req.user.id }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSops = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sops')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSop = async (req, res) => {
  const { id } = req.params;
  const { name, content } = req.body;
  if (!name || !content) {
    return res.status(400).json({ error: 'Name and content are required' });
  }

  try {
    // First check if SOP exists and belongs to user
    const { data: existingSop, error: checkError } = await supabase
      .from('sops')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (checkError) throw checkError;
    if (!existingSop) {
      return res.status(404).json({ error: 'SOP not found' });
    }

    // Update SOP
    const { data, error } = await supabase
      .from('sops')
      .update({ name, content })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSop = async (req, res) => {
  const { id } = req.params;
  try {
    // First check if SOP exists and belongs to user
    const { data: existingSop, error: checkError } = await supabase
      .from('sops')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (checkError) throw checkError;
    if (!existingSop) {
      return res.status(404).json({ error: 'SOP not found' });
    }

    // Delete SOP
    const { error } = await supabase
      .from('sops')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDefaultSops = async (req, res) => {
  const { role_id } = req.query;
  if (!role_id) {
    return res.status(400).json({ error: 'role_id is required' });
  }
  try {
    const { data, error } = await supabase
      .from('default_sops')
      .select('*')
      .eq('role_id', Number(role_id));
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 