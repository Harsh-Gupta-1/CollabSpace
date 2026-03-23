import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createRoom, getRoom, getUserRooms } from "../api/roomAPI";
import { 
  Code2, 
  Users, 
  Plus, 
  Search,
  LogOut,
  X,
  Hash,
  Filter,
  Sparkles,
  FolderOpen,
  ArrowRight,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userRooms, setUserRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [joinId, setJoinId] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 9;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchUserRooms();
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
  }, [navigate]);

  const fetchUserRooms = async () => {
    try {
      const rooms = await getUserRooms();
      setUserRooms(rooms);
    } catch (error) {
      toast.error("Failed to fetch your rooms");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const confirmCreate = async () => {
    if (!roomName.trim()) {
      toast.error("Please enter a room name");
      return;
    }
    setLoading(true);
    try {
      const room = await createRoom(roomName);
      setUserRooms([...userRooms, { _id: room._id, name: room.name, createdAt: room.createdAt }]);
      setShowCreateModal(false);
      setRoomName("");
      navigate(`/room/${room._id}`, {
        state: { name: user.username, roomName },
      });
    } catch (err) {
      toast.error("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const confirmJoin = async () => {
    if (!joinId.trim()) {
      toast.error("Please enter a room ID");
      return;
    }
    setLoading(true);
    try {
      const room = await getRoom(joinId);
      if (!userRooms.some((r) => r._id === room._id)) {
        setUserRooms([...userRooms, { _id: room._id, name: room.name, createdAt: room.createdAt }]);
      }
      setShowJoinModal(false);
      setJoinId("");
      navigate(`/room/${joinId}`, {
        state: { name: user.username, roomName: room.name },
      });
    } catch (err) {
      toast.error("Invalid Room ID or room not found");
    } finally {
      setLoading(false);
    }
  };

  const handleRoomJoin = (roomId, roomName) => {
    navigate(`/room/${roomId}`, {
      state: { name: user.username, roomName },
    });
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowJoinModal(false);
    setRoomName("");
    setJoinId("");
  };

  const getFilteredAndSortedRooms = () => {
    let filtered = userRooms.filter(room =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterType === "starred") {
      filtered = filtered.filter(room => room.isStarred);
    } else if (filterType === "archived") {
      filtered = filtered.filter(room => room.isArchived);
    } else if (filterType === "active") {
      filtered = filtered.filter(room => !room.isArchived);
    }

    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return filtered;
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getStats = () => {
    const totalRooms = userRooms.length;
    const recentRooms = userRooms.filter(room => {
      const daysDiff = Math.floor((new Date() - new Date(room.createdAt)) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    }).length;
    
    return { totalRooms, recentRooms };
  };

  const getMostRecentRoomTime = () => {
    if (userRooms.length === 0) return "None";
    const mostRecentRoom = userRooms.reduce((latest, room) => {
      return !latest || new Date(room.createdAt) > new Date(latest.createdAt) ? room : latest;
    }, null);
    return getTimeAgo(mostRecentRoom.createdAt);
  };

  const stats = getStats();
  const filteredRooms = getFilteredAndSortedRooms();
  
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
  const startIndex = (currentPage - 1) * roomsPerPage;
  const endIndex = startIndex + roomsPerPage;
  const currentRooms = filteredRooms.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, sortBy]);

  if (!user) {
    return (
      <div className="min-h-screen bg-surface-lowest flex items-center justify-center dark">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-primary font-medium font-body">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body overflow-hidden min-h-screen relative dark">
      {/* Kinetic Grid Background Layer */}
      <div className="fixed inset-0 bg-grid opacity-5 pointer-events-none z-0"></div>

      {/* SideNavBar Shell */}
      <aside className="fixed inset-y-0 left-0 flex flex-col z-40 w-64 bg-surface-container-lowest border-r border-outline-variant/10">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-1">
            <img src="/logo.svg" alt="CollabSpace Logo" className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tighter text-primary font-headline">CollabSpace</span>
          </div>
          <span className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant">Tactical Blueprint</span>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-4">
          <a className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary border-r-2 border-primary transition-all duration-150 ease-in-out group" href="#">
            <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
            <span className="font-label uppercase tracking-widest text-xs">Dashboard</span>
          </a>
        </nav>
        <div className="p-4 mt-auto border-t border-outline-variant/10 bg-surface-container-lowest">
          <div className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
            <span className="material-symbols-outlined" data-icon="account_circle">account_circle</span>
            <span className="font-label uppercase tracking-widest text-xs">{user.username}</span>
          </div>
          <div 
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
            onClick={handleLogout}
          >
            <span className="material-symbols-outlined" data-icon="logout">logout</span>
            <span className="font-label uppercase tracking-widest text-xs">Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex flex-col h-screen relative z-10 bg-grid">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-12">
          {/* Welcome Header */}
          <section className="flex justify-between items-end">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight font-headline text-white">Welcome back, {user.username}.</h1>
              <p className="text-on-surface-variant font-body">Pick up where you left off or start something new.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-surface-container border border-outline-variant/50 px-6 py-2.5 flex items-center gap-2 text-primary font-label text-xs font-bold uppercase tracking-widest hover:border-primary transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-sm" data-icon="add">add</span>
                Create Room
              </button>
              <button 
                onClick={() => setShowJoinModal(true)}
                className="bg-primary text-on-primary px-6 py-2.5 flex items-center gap-2 font-label text-xs font-bold uppercase tracking-widest primary-glow hover:brightness-110 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-sm" data-icon="tag">tag</span>
                Join Room
              </button>
            </div>
          </section>

          <div className="grid grid-cols-12 gap-8">
            {/* Hero: Continue Working (Col-8) */}
            <div className="col-span-8 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-label text-[10px] font-bold uppercase tracking-widest text-secondary">Continue Working</span>
                <div className="h-px flex-1 bg-outline-variant/10"></div>
              </div>
              
              {userRooms.length > 0 ? (() => {
                const latestRoom = [...userRooms].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                return (
                  <div className="group relative bg-surface-container-high border border-outline-variant/10 p-6 rounded-lg transition-all hover:border-primary/30">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold font-headline mb-1">{latestRoom.name}</h2>
                        <p className="text-on-surface-variant text-sm flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                          Opened {getTimeAgo(latestRoom.createdAt)}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleRoomJoin(latestRoom._id, latestRoom.name)}
                        className="bg-primary text-on-primary px-5 py-2 rounded-sm font-label text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:brightness-110 transition-all"
                      >
                        Resume Session
                        <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
                      </button>
                    </div>

                    {/* Whiteboard Preview Placeholder */}
                    <div className="relative h-64 bg-surface-container-lowest rounded-md border border-outline-variant/20 overflow-hidden">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
                      <div className="p-4 font-mono text-[10px] text-primary/40">
                        [SYSTEM_LOG]: Visualizing '{latestRoom.name}.blueprint'...<br/>
                        [LAYER_0]: Components initialized.<br/>
                        [LAYER_1]: Data streams connected.
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="grid grid-cols-3 gap-6 opacity-40">
                          <div className="w-24 h-24 border border-primary/40 bg-primary/5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary/30" data-icon="database">database</span>
                          </div>
                          <div className="w-32 h-16 border border-primary/40 bg-primary/5 mt-4 self-center relative">
                            <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary"></div>
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary"></div>
                          </div>
                          <div className="w-20 h-20 rounded-full border border-primary/40 bg-primary/5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary/30" data-icon="hub">hub</span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 flex -space-x-2">
                         <div className="w-8 h-8 rounded-full border-2 border-surface-container-high bg-primary flex items-center justify-center text-xs font-bold text-on-primary">
                           {user.username.charAt(0).toUpperCase()}
                         </div>
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="bg-surface-container-high border border-outline-variant/10 p-6 rounded-lg text-center py-12">
                  <span className="material-symbols-outlined text-4xl text-outline-variant mb-4" data-icon="folder_open">folder_open</span>
                  <p className="text-on-surface-variant font-body">No active rooms yet.</p>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 text-primary font-label text-xs font-bold uppercase tracking-widest hover:underline"
                  >
                    Create Your First Room
                  </button>
                </div>
              )}
            </div>

            {/* Live Now & Activity Feed (Col-4) */}
            <div className="col-span-4 flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Live Now</span>
                  <div className="h-px flex-1 bg-outline-variant/10"></div>
                </div>
                {userRooms.length > 0 ? (
                  <div className="bg-surface-container border border-outline-variant/10 p-4 rounded-sm hover:border-secondary/20 transition-all cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-2 h-2 bg-secondary rounded-full"></div>
                          <div className="absolute inset-0 bg-secondary rounded-full animate-ping opacity-75"></div>
                        </div>
                        <span className="font-headline font-semibold text-sm truncate max-w-[120px]">
                          {userRooms.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0].name}
                        </span>
                      </div>
                      <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-on-surface-variant italic p-4 bg-surface-container border border-outline-variant/10 rounded-sm">
                    No active sessions
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Terminal Log</span>
                  <div className="h-px flex-1 bg-outline-variant/10"></div>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/10 p-4 rounded-sm flex-1 font-mono text-xs overflow-hidden h-[256px]">
                  <div className="space-y-3 opacity-80">
                    <div className="flex gap-3">
                      <span className="text-secondary opacity-50">SYS</span>
                      <p className="text-on-surface-variant">Dashboard initialized for <span className="text-primary">{user.username}</span></p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-secondary opacity-50">API</span>
                      <p className="text-on-surface-variant">Fetched {userRooms.length} workspace rooms</p>
                    </div>
                    {userRooms.length > 0 && (
                      <div className="flex gap-3">
                        <span className="text-secondary opacity-50">SYNC</span>
                        <p className="text-on-surface-variant">Local cache loaded</p>
                      </div>
                    )}
                    <div className="border-l border-primary/20 pl-3 py-1 mt-4">
                      <p className="text-primary/40 animate-pulse italic">Waiting for incoming packets...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Cards Grid */}
            <div className="col-span-12">
              <div className="flex items-center gap-2 mb-6">
                <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Active Workspace Rooms ({userRooms.length})</span>
                <div className="h-px flex-1 bg-outline-variant/10"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userRooms.map((room, idx) => {
                  const colors = ['primary', 'tertiary', 'secondary'];
                  const icons = ['database', 'hub', 'layers'];
                  const themeColor = colors[idx % 3];
                  const iconName = icons[idx % 3];

                  const colorMap = {
                    primary: { text: "text-primary/30", border: "border-primary/40", bg: "bg-primary/5" },
                    secondary: { text: "text-secondary/30", border: "border-secondary/40", bg: "bg-secondary/5" },
                    tertiary: { text: "text-tertiary/30", border: "border-tertiary/40", bg: "bg-tertiary/5" },
                  };
                  const themeClasses = colorMap[themeColor];

                  return (
                    <div key={room._id} className="group relative bg-surface-container border border-outline-variant/10 p-5 rounded-sm transition-all hover:bg-surface-container-high hover:border-primary/20">
                      <div className="aspect-video bg-surface-container-lowest rounded-sm mb-4 overflow-hidden relative border border-outline-variant/10">
                        <div className="absolute inset-0 bg-surface-container-lowest bg-grid opacity-20"></div>
                        <div className={`absolute inset-0 p-4 font-mono text-[8px] ${themeClasses.text}`}>
                          [ROOM_LOG]: '{room.name}' active...<br/>
                          [STATUS]: Online.
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-40">
                          <div className={`w-12 h-12 border flex items-center justify-center ${themeClasses.border} ${themeClasses.bg}`}>
                            <span className={`material-symbols-outlined text-lg ${themeClasses.text}`} data-icon={iconName}>{iconName}</span>
                          </div>
                        </div>

                        {/* Hover Overlay Quick Actions */}
                        <div className="absolute inset-0 bg-surface/90 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <button 
                            onClick={() => handleRoomJoin(room._id, room.name)}
                            className="w-10 h-10 rounded-sm bg-surface-container-highest text-primary border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors" title="Open Room"
                          >
                            <span className="material-symbols-outlined text-xl" data-icon="arrow_forward">arrow_forward</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-headline font-bold truncate pr-4">{room.name}</h3>
                        <div className="flex gap-2 flex-shrink-0">
                          <span className="material-symbols-outlined text-xs text-on-surface-variant" data-icon="code">code</span>
                          <span className="material-symbols-outlined text-xs text-on-surface-variant" data-icon="chat">chat</span>
                        </div>
                      </div>
                      
                      <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest mb-4">
                        Created {new Date(room.createdAt).toLocaleDateString()}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-1.5">
                          <div className="w-6 h-6 rounded-full border border-surface-container bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant text-sm cursor-pointer hover:text-white" data-icon="more_vert">more_vert</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals styled for dark theme */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-container border border-outline-variant/30 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-headline text-white">Create New Room</h3>
                <button
                  onClick={closeModals}
                  className="text-on-surface-variant hover:text-white p-1"
                >
                  <span className="material-symbols-outlined" data-icon="close">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Room Name</label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && confirmCreate()}
                    placeholder="Enter room name..."
                    className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/50 font-body"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={closeModals}
                    className="flex-1 bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-white font-label text-xs uppercase tracking-widest py-3 rounded-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmCreate}
                    disabled={loading || !roomName.trim()}
                    className="flex-1 bg-primary hover:brightness-110 disabled:opacity-50 text-on-primary font-bold font-label text-xs uppercase tracking-widest py-3 rounded-sm transition-colors primary-glow"
                  >
                    {loading ? 'Creating...' : 'Create Room'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-container border border-outline-variant/30 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-headline text-white">Join Room</h3>
                <button
                  onClick={closeModals}
                  className="text-on-surface-variant hover:text-white p-1"
                >
                  <span className="material-symbols-outlined" data-icon="close">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Room ID</label>
                  <input
                    type="text"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && confirmJoin()}
                    placeholder="Paste room ID here..."
                    className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/50 font-body"
                    autoFocus
                  />
                  <p className="text-[10px] uppercase font-label tracking-widest text-on-surface-variant mt-2">
                    Ask your teammate for the room ID
                  </p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={closeModals}
                    className="flex-1 bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-white font-label text-xs uppercase tracking-widest py-3 rounded-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmJoin}
                    disabled={loading || !joinId.trim()}
                    className="flex-1 bg-primary hover:brightness-110 disabled:opacity-50 text-on-primary font-bold font-label text-xs uppercase tracking-widest py-3 rounded-sm transition-colors primary-glow"
                  >
                    {loading ? 'Joining...' : 'Join Room'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}