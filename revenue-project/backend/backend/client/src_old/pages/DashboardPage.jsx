import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth, API } from "../App";
import axios from "axios";
import { toast } from "sonner";
import { Users, Fire, Phone, CurrencyDollar, TrendUp, ArrowRight, Plus, Clock, CheckCircle, Calendar, Lightning } from "@phosphor-icons/react";
export default DashboardPage;