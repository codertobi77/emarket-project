"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="group relative bg-background border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 overflow-hidden">
          <div className="relative z-10 flex items-center justify-center">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all text-primary/80 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all text-primary/80 dark:rotate-0 dark:scale-100 inset-0 m-auto" />
          </div>
          <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border border-border/40 bg-background/80 backdrop-blur-sm">
        <DropdownMenuItem 
          onClick={() => setTheme("light")} 
          className="hover:bg-primary/5 hover:text-primary transition-colors duration-200 focus:bg-primary/5 focus:text-primary">
          <Sun className="h-[1rem] w-[1rem] mr-2 text-yellow-500" />
          Clair
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")} 
          className="hover:bg-primary/5 hover:text-primary transition-colors duration-200 focus:bg-primary/5 focus:text-primary">
          <Moon className="h-[1rem] w-[1rem] mr-2 text-indigo-400" />
          Sombre
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")} 
          className="hover:bg-primary/5 hover:text-primary transition-colors duration-200 focus:bg-primary/5 focus:text-primary">
          <span className="relative h-[1rem] w-[1rem] mr-2 overflow-hidden flex items-center justify-center">
            <Sun className="absolute h-[0.8rem] w-[0.8rem] translate-x-[-4px] text-yellow-500" />
            <Moon className="absolute h-[0.8rem] w-[0.8rem] translate-x-[4px] text-indigo-400" />
          </span>
          Système
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}