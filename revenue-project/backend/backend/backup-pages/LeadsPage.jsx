import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth, API } from "../App";
import axios from "axios";
import { toast } from "sonner";
import { MagnifyingGlass, Funnel, Phone, Check, X, CaretDown, Clock, Fire, Export, NotePencil } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
export default LeadsPage;