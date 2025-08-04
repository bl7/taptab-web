'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Clock, User, MapPin, DollarSign, Eye, CheckCircle, XCircle, AlertCircle, Filter, Search, X, Calendar, Tag, Users, Coffee, Utensils, Printer } from 'lucide-react';
import { useOrders } from '@/lib/use-orders';
import { OrderStatus, Order } from '@/lib/orders-api';
import { api } from '@/lib/api';
import { Table, OrderModificationChange } from '@/lib/api';
import { ReceiptGenerator } from '@/lib/receipt-generator';
import EditOrderModal from '@/components/EditOrderModal'; // Added import for EditOrderModal

export default function OrdersPage() {
  const { 
    orders, 
    loading, 
    error, 
    refreshOrders 
  } = useOrders();

  // State for tables and table view
  const [tables, setTables] = useState<Table[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showTableOrders, setShowTableOrders] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Payment and cancellation modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [orderToAction, setOrderToAction] = useState<Order | null>(null);
  
  // Edit order modal
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  
  // Print receipt modal
  const [showPrintReceiptModal, setShowPrintReceiptModal] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  const [printReceiptType, setPrintReceiptType] = useState<'kitchen' | 'customer' | null>(null);
  const [printingReceipt, setPrintingReceipt] = useState(false);

  // Menu items for edit order modal
  const [menuItems, setMenuItems] = useState<Array<{ id: string; name: string; price: number; category: string }>>([]);
  const [menuCategories, setMenuCategories] = useState<Array<{ id: string; name: string }>>([]);

  // Load tables on component mount
  useEffect(() => {
    const loadTables = async () => {
      try {
        setTablesLoading(true);
        const response = await api.getTables();
        setTables(response.tables);
      } catch (error) {
        console.error('Failed to load tables:', error);
      } finally {
        setTablesLoading(false);
      }
    };

    loadTables();
  }, []);



  // Get orders for a specific table
  const getTableOrders = useCallback((tableId: string) => {
    // Try to find the table by ID to get its number
    const table = tables.find(t => t.id === tableId);
    const tableNumber = table?.number;
    
    const tableOrders = orders.filter(order => {
      // Try multiple matching strategies
      const matchesById = order.tableId === tableId;
      const matchesByNumber = order.tableNumber === tableNumber;
      const matchesByTableNumber = order.tableNumber === tableId;
      const matchesByTableNumberString = order.tableNumber === tableNumber?.toString();
      
      const isMatch = matchesById || matchesByNumber || matchesByTableNumber || matchesByTableNumberString;
      const isActive = order.status === 'active';
      
      return isMatch && isActive;
    });
    
    return tableOrders;
  }, [tables, orders]);

  // Get table status based on orders
  const getTableStatus = useCallback((table: Table) => {
    const tableOrders = getTableOrders(table.id);
    if (tableOrders.length > 0) {
      return 'occupied';
    }
    return table.status;
  }, [getTableOrders]);

  // Get table total revenue
  const getTableRevenue = (tableId: string) => {
    const tableOrders = getTableOrders(tableId);
    return tableOrders.reduce((sum, order) => {
      const orderTotal = order.finalAmount || order.totalAmount || order.total || 
        order.items.reduce((itemSum, item) => itemSum + (item.total || 0), 0);
      return sum + orderTotal;
    }, 0);
  };

  // Get table order count
  const getTableOrderCount = (tableId: string) => {
    return getTableOrders(tableId).length;
  };

  // Filter tables based on search
  const filteredTables = useMemo(() => {
    return tables.filter(table => {
      const searchMatch = !searchTerm || 
        table.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (table.location && table.location.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return searchMatch;
    });
  }, [tables, searchTerm]);

  // Get table status color
  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-red-100 text-red-800 border-red-200';
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'reserved': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cleaning': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get table status icon
  const getTableStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied': return <Users className="h-4 w-4" />;
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'reserved': return <Clock className="h-4 w-4" />;
      case 'cleaning': return <Utensils className="h-4 w-4" />;
      default: return <Coffee className="h-4 w-4" />;
    }
  };

  // Handle table click
  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setShowTableOrders(true);
  };

  // Get order statisticsnu
  const orderStats = useMemo(() => {
    const activeOrders = orders.filter(order => order.status === 'active');
    
    const stats = {
      total : activeOrders.length,
      totalRevenue: activeOrders.reduce((sum, order) => {
        const orderTotal = order.finalAmount || order.totalAmount || order.total || 
          order.items.reduce((itemSum, item) => itemSum + (item.total || 0), 0);
        return sum + orderTotal;
      }, 0),
      occupiedTables: tables.filter(table => getTableStatus(table) === 'occupied').length,
      totalTables: tables.length,
    };
    return stats;
  }, [orders, tables, getTableStatus]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getOrderSourceBadgeClass = (orderSource: string) => {
    switch (orderSource) {
      case 'qr': return 'bg-blue-100 text-blue-800';
      case 'pos': return 'bg-green-100 text-green-800';
      case 'phone': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelOrder = async (orderId: string, reason: string) => {
    setDeletingOrder(orderId);
    try {
      await api.cancelOrder(orderId, reason);
      alert('Order cancelled successfully');
      refreshOrders();
      setShowCancelModal(false);
      setCancelReason('');
      setOrderToAction(null);
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert('Failed to cancel order');
    } finally {
      setDeletingOrder(null);
    }
  };

  const openPaymentModal = (order: Order) => {
    setOrderToAction(order);
    setShowPaymentModal(true);
  };

  const openCancelModal = (order: Order) => {
    setOrderToAction(order);
    setShowCancelModal(true);
  };

  const handlePaymentWithMethod = async (paymentMethod: 'CASH' | 'CARD' | 'QR' | 'ONLINE') => {
    if (!orderToAction) return;
    
    try {
      // First mark the order as paid
      await api.markOrderAsPaid(orderToAction.id, paymentMethod);
      
      // Then update the order status to 'paid'
      await api.updateOrderStatus(orderToAction.id, 'paid');
      
      alert(`Order marked as paid via ${paymentMethod}`);
      refreshOrders();
      setShowPaymentModal(false);
      setOrderToAction(null);
    } catch (error) {
      console.error('Error marking order as paid:', error);
      alert('Failed to mark order as paid');
    }
  };

  const handleCancelWithReason = async () => {
    if (!orderToAction || !cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }
    
    await handleCancelOrder(orderToAction.id, cancelReason.trim());
  };

  const openEditOrderModal = async (order: Order) => {
    setEditingOrder(order);
    setShowEditOrderModal(true);
    
    // Load menu items if not already loaded
    if (menuItems.length === 0) {
      try {
        const [menuResponse, categoriesResponse] = await Promise.all([
          api.getMenuItems(),
          api.getMenuCategories()
        ]);
        setMenuItems(menuResponse.items);
        setMenuCategories(categoriesResponse.categories);
      } catch (error) {
        console.error('Error loading menu data:', error);
      }
    }
  };

  const closeEditOrderModal = () => {
    setEditingOrder(null);
    setShowEditOrderModal(false);
  };

  const handleModifyOrder = async (
    orderId: string,
    changes: OrderModificationChange[]
  ) => {
    try {
      // Use the new batch API method
      const result = await api.modifyOrderBatch(orderId, changes);
      
      if (result.success) {
        // Refresh orders to get updated data
        await refreshOrders();
        
        // Update the editing order if it's the same order
        if (editingOrder && editingOrder.id === orderId) {
          // Refresh the editing order data
          const updatedOrder = orders.find(order => order.id === orderId);
          if (updatedOrder) {
            setEditingOrder(updatedOrder);
          }
        }
        
        console.log('Order modified successfully with batch changes:', result);
        
        // Trigger receipt printing for modified orders using existing system
        if (editingOrder) {
          try {
            // Convert Order to OrderData format for printing
            const orderData = {
              id: editingOrder.id,
              orderNumber: editingOrder.orderNumber || editingOrder.id.slice(-8),
              tableNumber: editingOrder.tableNumber,
              totalAmount: editingOrder.totalAmount || 0,
              finalAmount: editingOrder.finalAmount || editingOrder.totalAmount || 0,
              status: editingOrder.status,
              customerName: editingOrder.customerName || 'Walk-in Customer',
              customerPhone: editingOrder.customerPhone || '',
              orderSource: editingOrder.orderSource,
              items: editingOrder.items.map(item => ({
                id: item.id,
                menuItemId: item.menuItemId,
                menuItemName: item.menuItemName,
                quantity: item.quantity,
                price: item.price,
                total: item.total || (item.price * item.quantity),
                notes: item.notes
              })),
              createdAt: editingOrder.createdAt,
              updatedAt: editingOrder.updatedAt
            };

            // Note: Receipt printing is handled automatically by the WebSocket notification system
            // when the backend sends the orderModified event. No manual printing needed here.
            console.log('✅ Order modification completed - receipt will be printed via WebSocket notification');
            
          } catch (printError) {
            console.warn('⚠️ Error in order modification process:', printError);
          }
        }
        
        // Note: The existing WebSocket system will handle any notifications
        // if the backend sends order modification events. For now, we just
        // log the success and let the existing notification system handle
        // any real-time updates that come through WebSocket.
        
      } else {
        throw new Error('Failed to modify order');
      }
      
    } catch (error) {
      console.error('Error modifying order:', error);
      throw error;
    }
  };

  const openPrintReceiptModal = (order: Order) => {
    setOrderToPrint(order);
    setShowPrintReceiptModal(true);
  };

  const closePrintReceiptModal = () => {
    setOrderToPrint(null);
    setPrintReceiptType(null);
    setShowPrintReceiptModal(false);
  };

  const printReceipt = async (type: 'kitchen' | 'customer') => {
    if (!orderToPrint) return;
    
    setPrintingReceipt(true);
    try {
      const receiptGenerator = new ReceiptGenerator();
      
      // Convert Order to OrderData format
      const orderData = {
        id: orderToPrint.id,
        orderNumber: orderToPrint.orderNumber || orderToPrint.id.slice(-8),
        tableNumber: orderToPrint.tableNumber,
        totalAmount: orderToPrint.totalAmount || 0,
        finalAmount: orderToPrint.finalAmount || orderToPrint.totalAmount || 0,
        status: orderToPrint.status,
        customerName: orderToPrint.customerName || 'Walk-in Customer',
        customerPhone: orderToPrint.customerPhone || '',
        orderSource: orderToPrint.orderSource,
        items: orderToPrint.items.map(item => ({
          id: item.id,
          menuItemId: item.menuItemId,
          menuItemName: item.menuItemName,
          quantity: item.quantity,
          price: item.price,
          total: item.total || (item.price * item.quantity),
          notes: item.notes
        })),
        createdAt: orderToPrint.createdAt,
        updatedAt: orderToPrint.updatedAt
      };

      // Generate receipt PNG
      const receiptDataURL = await receiptGenerator.generateReceiptPNG(orderData);
      
      // Calculate dimensions
      const labelWidth = 56; // 56mm receipt width
      const actualHeightPixels = receiptGenerator.getHeight(orderData);
      const labelHeight = Math.ceil(actualHeightPixels * 25.4 / 120); // Convert pixels to mm at 120 DPI
      
      // OS-specific data format
      const platform = navigator.platform.toLowerCase();
      const userAgent = navigator.userAgent.toLowerCase();
      const isMac = platform.includes('mac') || userAgent.includes('mac');
      
      let printData: { type?: string; images?: string[]; labelWidth?: number; labelHeight?: number; image?: string; selectedPrinter: string };
      if (isMac) {
        // Mac format: base64-only image
        const base64Only = receiptDataURL.replace('data:image/png;base64,', '');
        printData = {
          type: 'print',
          images: [base64Only],
          selectedPrinter: "Receipt Printer"
        };
      } else {
        // Windows/Linux format: full data URL with dimensions
        printData = {
          labelWidth: labelWidth,
          labelHeight: labelHeight,
          image: receiptDataURL,
          selectedPrinter: "Receipt Printer"
        };
      }
      
      // Send to PrintBridge
      const printBridgeURL = isMac ? 'ws://localhost:8080' : 'ws://localhost:8080/ws';
      const ws = new WebSocket(printBridgeURL);
      
      ws.onopen = () => {
        console.log(`🖨️ Printing ${type} receipt for order:`, orderData.orderNumber);
        ws.send(JSON.stringify(printData));
        ws.close();
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} receipt printed successfully!`);
      };
      
      ws.onerror = () => {
        console.warn('⚠️ PrintBridge not connected');
        alert('PrintBridge not connected. Please start the PrintBridge server.');
      };
      
    } catch (error) {
      console.error('❌ Error printing receipt:', error);
      alert('Failed to print receipt. Please try again.');
    } finally {
      setPrintingReceipt(false);
      closePrintReceiptModal();
    }
  };

  if (loading || tablesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-black">Loading tables and orders...</p>
          <p className="text-sm text-black opacity-75 mt-2">Connecting to backend server...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-black mb-2">Error Loading Data</h1>
          <p className="text-black mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={refreshOrders}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mr-2"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If showing table orders, render the table orders view
  if (showTableOrders && selectedTable) {
    const tableOrders = getTableOrders(selectedTable.id);
    
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setShowTableOrders(false);
                setSelectedTable(null);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Back to Tables</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-black">Table {selectedTable.number}</h1>
              <p className="text-gray-600">Orders for this table</p>
            </div>
          </div>
          <button
            onClick={refreshOrders}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Table Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${getTableStatusColor(getTableStatus(selectedTable))}`}>
                {getTableStatusIcon(getTableStatus(selectedTable))}
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-black capitalize">{getTableStatus(selectedTable)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Capacity</p>
                <p className="font-semibold text-black">{selectedTable.capacity} people</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="font-semibold text-black">${getTableRevenue(selectedTable.id).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="font-semibold text-black">{tableOrders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {tableOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Coffee className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">No Active Orders</h3>
            <p className="text-gray-600">This table has no active orders at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tableOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedOrder(order);
                  setShowOrderModal(true);
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {order.orderNumber || `Order ${order.id.slice(-8)}`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditOrderModal(order);
                      }}
                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Edit Order
                    </button>
                    <span className="text-lg font-bold text-black">
                      ${(order.totalAmount || order.finalAmount || order.total || 
                        order.items.reduce((sum, item) => sum + (item.total || 0), 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Table {order.tableNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {order.customerName || 'Walk-in Customer'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderSourceBadgeClass(order.orderSource || '')}`}>
                      {order.orderSource || 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 font-medium">
                      {order.waiterName || order.sourceDetails || 'Unknown Waiter'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-black mb-3">Items:</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-black">
                              {item.menuItemName} x{item.quantity}
                            </span>
                            <span className="text-sm text-gray-600">
                              ${(item.price || 0).toFixed(2)} each
                            </span>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-gray-500 italic mt-1">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                        <span className="font-medium text-black">
                          ${(item.total || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-black">Order Details</h2>
                    <p className="text-sm text-gray-600">
                      Order: {selectedOrder.orderNumber || selectedOrder.id.slice(-8)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowOrderModal(false);
                      setSelectedOrder(null);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Table {selectedOrder.tableNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedOrder.customerName || 'Walk-in Customer'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderSourceBadgeClass(selectedOrder.orderSource || '')}`}>
                      {selectedOrder.orderSource || 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 font-medium">
                      Waiter: {selectedOrder.waiterName || selectedOrder.sourceDetails || 'Unknown Waiter'}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-black mb-3">Items:</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-black">
                              {item.menuItemName} x{item.quantity}
                            </span>
                            <span className="text-sm text-gray-600">
                              ${(item.price || 0).toFixed(2)} each
                            </span>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-gray-500 italic mt-1">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                        <span className="font-medium text-black">
                          ${(item.total || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-black">Total Amount:</span>
                  <span className="text-lg font-bold text-green-600">
                    ${(selectedOrder.totalAmount || selectedOrder.finalAmount || selectedOrder.total || 
                      selectedOrder.items.reduce((sum, item) => sum + (item.total || 0), 0)).toFixed(2)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setShowOrderModal(false);
                      setSelectedOrder(null);
                      openEditOrderModal(selectedOrder);
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Edit Order
                  </button>
                  <button
                    onClick={() => {
                      setShowOrderModal(false);
                      setSelectedOrder(null);
                      openPaymentModal(selectedOrder);
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Mark as Paid
                  </button>
                  <button
                    onClick={() => {
                      setShowOrderModal(false);
                      setSelectedOrder(null);
                      openPrintReceiptModal(selectedOrder);
                    }}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center"
                  >
                    <Printer className="h-4 w-4 mr-1" />
                    Print Receipt
                  </button>
                  <button
                    onClick={() => {
                      setShowOrderModal(false);
                      setSelectedOrder(null);
                      openCancelModal(selectedOrder);
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method Modal */}
        {showPaymentModal && orderToAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Select Payment Method</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Order: {orderToAction.orderNumber || orderToAction.id.slice(-8)}
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => handlePaymentWithMethod('CASH')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-medium"
                  >
                    Cash
                  </button>
                  <button
                    onClick={() => handlePaymentWithMethod('CARD')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-medium"
                  >
                    Card
                  </button>
                  <button
                    onClick={() => handlePaymentWithMethod('QR')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-medium"
                  >
                    QR
                  </button>
                  <button
                    onClick={() => handlePaymentWithMethod('ONLINE')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-medium"
                  >
                    Online
                  </button>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setOrderToAction(null);
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Order Modal */}
        {showCancelModal && orderToAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Cancel Order</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Order: {orderToAction.orderNumber || orderToAction.id.slice(-8)}
                </p>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-black mb-2">
                    Reason for Cancellation
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Enter reason for cancellation..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancelWithReason}
                    disabled={deletingOrder === orderToAction.id}
                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    {deletingOrder === orderToAction.id ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancelReason('');
                      setOrderToAction(null);
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Order Modal */}
        {showEditOrderModal && editingOrder && (
          <EditOrderModal
            order={editingOrder}
            onClose={closeEditOrderModal}
            onModifyOrder={handleModifyOrder}
          />
        )}

        {/* Print Receipt Modal */}
        {showPrintReceiptModal && orderToPrint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-black">Print Receipt</h2>
                    <p className="text-sm text-gray-600">
                      Order: {orderToPrint.orderNumber || orderToPrint.id.slice(-8)}
                    </p>
                  </div>
                  <button
                    onClick={closePrintReceiptModal}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-4">Select Receipt Type:</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => printReceipt('kitchen')}
                      disabled={printingReceipt}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center"
                    >
                      <Utensils className="h-4 w-4 mr-2" />
                      {printingReceipt && printReceiptType === 'kitchen' ? 'Printing...' : 'Kitchen Receipt'}
                    </button>
                    <button
                      onClick={() => printReceipt('customer')}
                      disabled={printingReceipt}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center"
                    >
                      <User className="h-4 w-4 mr-2" />
                      {printingReceipt && printReceiptType === 'customer' ? 'Printing...' : 'Customer Receipt'}
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p className="mb-2"><strong>Kitchen Receipt:</strong> For kitchen staff with cooking instructions</p>
                  <p><strong>Customer Receipt:</strong> For customer with payment details</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main tables view
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">View and manage all restaurant orders by table</p>
        </div>
        <button
          onClick={refreshOrders}
          className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
        >
          <Eye className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl flex items-center space-x-2 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
          </button>
        </div>
        
        {showFilters && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tables, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tables</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.totalTables}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Coffee className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupied Tables</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.occupiedTables}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-200">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50 text-green-600 border border-green-200">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${orderStats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Professional Table Management Interface */}
      {filteredTables.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Coffee className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">No Tables Found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'No tables match your search criteria.' : 'No tables have been configured yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl p-8 shadow-2xl">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Table Management</h3>
            <p className="text-gray-400">Click on any table to view its orders</p>
          </div>
          
          {/* Tables Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredTables.map((table) => {
              const tableStatus = getTableStatus(table);
              const orderCount = getTableOrderCount(table.id);
              const revenue = getTableRevenue(table.id);
              
              // Get table appearance based on status
              const getTableAppearance = (status: string) => {
                switch (status) {
                  case 'occupied':
                    return {
                      bg: 'bg-red-500',
                      text: 'text-white',
                      border: 'border-red-400',
                      statusBg: 'bg-red-600',
                      statusText: 'text-white'
                    };
                  case 'available':
                    return {
                      bg: 'bg-green-500',
                      text: 'text-white',
                      border: 'border-green-400',
                      statusBg: 'bg-green-600',
                      statusText: 'text-white'
                    };
                  case 'reserved':
                    return {
                      bg: 'bg-purple-500',
                      text: 'text-white',
                      border: 'border-purple-400',
                      statusBg: 'bg-purple-600',
                      statusText: 'text-white'
                    };
                  case 'cleaning':
                    return {
                      bg: 'bg-blue-500',
                      text: 'text-white',
                      border: 'border-blue-400',
                      statusBg: 'bg-blue-600',
                      statusText: 'text-white'
                    };
                  default:
                    return {
                      bg: 'bg-gray-500',
                      text: 'text-white',
                      border: 'border-gray-400',
                      statusBg: 'bg-gray-600',
                      statusText: 'text-white'
                    };
                }
              };
              
              const appearance = getTableAppearance(tableStatus);
              const statusText = tableStatus === 'occupied' ? 'Occupied' : 
                               tableStatus === 'available' ? 'Free' : 
                               tableStatus === 'reserved' ? 'Reserved' : 
                               tableStatus === 'cleaning' ? 'Cleaning' : 'Unknown';
              
                             // Get table shape and size based on capacity
               const getTableShape = (capacity: number) => {
                 if (capacity <= 2) return 'rounded-full min-w-[6rem] min-h-[6rem]'; // Circle for 2-seater
                 if (capacity <= 4) return 'rounded-2xl min-w-[7rem] min-h-[7rem]'; // Square for 4-seater
                 if (capacity <= 6) return 'rounded-2xl min-w-[8rem] min-h-[5rem]'; // Rectangle for 6-seater
                 return 'rounded-2xl min-w-[9rem] min-h-[6rem]'; // Long rectangle for 8+ seater
               };
               
               return (
                 <div
                   key={table.id}
                   onClick={() => handleTableClick(table)}
                   className="relative group cursor-pointer transition-all duration-300 hover:scale-105"
                 >
                   {/* Table Card */}
                   <div className={`relative ${appearance.bg} ${getTableShape(table.capacity)} shadow-lg border-2 ${appearance.border} transition-all duration-300 hover:shadow-xl flex flex-col items-center justify-center p-3`}>
                     {/* Table Number */}
                     <div className="text-center">
                       <span className={`text-xl font-bold ${appearance.text}`}>
                         {table.number}
                       </span>
                     </div>
                     
                     {/* Status Badge */}
                     <div className="text-center mt-1">
                       <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${appearance.statusBg} ${appearance.statusText}`}>
                         {statusText}
                       </span>
                     </div>
                     
                     {/* Additional Info for Occupied Tables */}
                     {tableStatus === 'occupied' && (
                       <div className="mt-1 space-y-1">
                         <div className="flex items-center justify-center space-x-1">
                           <Users className="h-3 w-3 text-white/80" />
                           <span className="text-xs text-white/80">{orderCount}</span>
                         </div>
                         <div className="flex items-center justify-center space-x-1">
                           <DollarSign className="h-3 w-3 text-white/80" />
                           <span className="text-xs text-white/80">${revenue.toFixed(0)}</span>
                         </div>
                       </div>
                     )}
                     
                     {/* Capacity Info */}
                     <div className="absolute top-1 right-1">
                       <div className="bg-white/20 backdrop-blur-sm rounded-full w-5 h-5 flex items-center justify-center">
                         <span className="text-xs font-bold text-white">{table.capacity}</span>
                       </div>
                     </div>
                     
                     {/* Pulse effect for occupied tables */}
                     {tableStatus === 'occupied' && (
                       <div className="absolute inset-0 bg-red-400 animate-pulse opacity-20 rounded-full"></div>
                     )}
                   </div>
                   
                   {/* Table Label */}
                   <div className="text-center mt-2">
                     <span className="text-sm font-medium text-gray-300">Table {table.number}</span>
                   </div>
                   
                   {/* Hover Tooltip */}
                   <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20">
                     <div className="bg-gray-800 text-white text-sm rounded-lg px-4 py-3 whitespace-nowrap shadow-2xl border border-gray-700">
                       <div className="font-bold mb-1">Table {table.number}</div>
                       <div className="text-gray-300 mb-2">{table.capacity} seats</div>
                       {tableStatus === 'occupied' && (
                         <>
                           <div className="text-green-400 font-semibold">${revenue.toFixed(2)} revenue</div>
                           <div className="text-red-400 font-semibold">{orderCount} order{orderCount !== 1 ? 's' : ''}</div>
                         </>
                       )}
                       {table.location && <div className="text-gray-400 text-xs mt-1">{table.location}</div>}
                     </div>
                     <div className="w-2 h-2 bg-gray-800 transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-1"></div>
                   </div>
                 </div>
               );
            })}
          </div>
          
          {/* Status Legend */}
          <div className="mt-8 bg-gray-800 rounded-xl p-6">
            <h4 className="text-white font-semibold mb-4">Table Status Legend</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-300 text-sm">Free</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-gray-300 text-sm">Occupied</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <span className="text-gray-300 text-sm">Reserved</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300 text-sm">Cleaning</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 