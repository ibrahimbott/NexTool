import React from 'react';

export type Category = 'Text' | 'Image' | 'Developer' | 'PDF' | 'SEO' | 'CSS' | 'Math' | 'Converter' | 'Business';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: Category;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  component?: React.ComponentType;
  isPopular?: boolean;
  isNew?: boolean;
}

export interface SidebarProps {
  categories: Category[];
  activeCategory: Category | 'All';
  onCategorySelect: (cat: Category | 'All') => void;
}