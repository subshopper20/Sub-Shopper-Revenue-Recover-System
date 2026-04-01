import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth, API } from "../App";
import axios from "axios";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { CurrencyDollar, TrendUp, TrendDown, Calendar, Clock, Export, ArrowsClockwise } from "@phosphor-icons/react";
export default AnalyticsPage;