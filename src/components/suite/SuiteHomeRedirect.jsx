import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function SuiteHomeRedirect() {
  const { search, hash } = useLocation();
  return <Navigate to={{ pathname: '/', search, hash }} replace />;
}