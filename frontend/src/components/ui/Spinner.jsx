import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 16, className = 'text-indigo-500' }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} />
);

export default Spinner;
