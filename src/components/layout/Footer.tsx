
import React from "react";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t">
      <div className="section-container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">ResilientFI</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              AI-powered Operational Risk Management for Canadian financial institutions.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Modules</h3>
            <ul className="space-y-2">
              <li><Link to="/governance" className="text-slate-600 dark:text-slate-400 hover:text-primary">Governance</Link></li>
              <li><Link to="/self-assessment" className="text-slate-600 dark:text-slate-400 hover:text-primary">Self Assessment</Link></li>
              <li><Link to="/risk-management" className="text-slate-600 dark:text-slate-400 hover:text-primary">Risk Management</Link></li>
              <li><Link to="/incident-management" className="text-slate-600 dark:text-slate-400 hover:text-primary">Incident Management</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/resources/e21" className="text-slate-600 dark:text-slate-400 hover:text-primary">E-21 Guideline</Link></li>
              <li><Link to="/resources/b10" className="text-slate-600 dark:text-slate-400 hover:text-primary">B-10 Guideline</Link></li>
              <li><Link to="/resources/b13" className="text-slate-600 dark:text-slate-400 hover:text-primary">B-13 Guideline</Link></li>
              <li><Link to="/resources/iso22301" className="text-slate-600 dark:text-slate-400 hover:text-primary">ISO 22301</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-slate-600 dark:text-slate-400 hover:text-primary">About</Link></li>
              <li><Link to="/contact" className="text-slate-600 dark:text-slate-400 hover:text-primary">Contact</Link></li>
              <li><Link to="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-600 dark:text-slate-400 hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} ResilientFI. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="https://twitter.com" className="text-slate-600 dark:text-slate-400 hover:text-primary">
              Twitter
            </a>
            <a href="https://linkedin.com" className="text-slate-600 dark:text-slate-400 hover:text-primary">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
