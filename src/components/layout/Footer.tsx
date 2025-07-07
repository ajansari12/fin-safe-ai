
import React from "react";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import Newsletter from "../home/Newsletter";

const Footer = () => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-900">
      <Newsletter />
      
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
            <div className="flex space-x-4">
              <a href="https://twitter.com" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://linkedin.com" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="/compliance" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Compliance</Link></li>
              <li><Link to="/auth/login" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Login</Link></li>
              <li><Link to="/auth/register" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Get Started</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#regulations" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Regulations</a></li>
              <li><a href="#documentation" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#support" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Support</a></li>
              <li><a href="#blog" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/contact" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} ResilientFI. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
              Terms
            </Link>
            <Link to="/cookies" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
