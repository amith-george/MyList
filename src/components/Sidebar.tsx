'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarSeparator,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Search,
  Star,
  User,
  ChevronUp,
  Film,
  FilmIcon,
  Tv,
  Pencil,
  Trash2,
} from 'lucide-react';

import ListUpdate from '@/components/ListUpdate';
import ListDelete from '@/components/ListDelete';
import { getUserIdFromToken } from '@/utils/auth';
import { useListContext } from '@/context/ListContext';
import { useListFilter } from '@/context/ListFilterContext';

function AppSidebar() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  const [avatar, setAvatar] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setAvatar(localStorage.getItem('avatar'));
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername);
    const uid = getUserIdFromToken();
    setUserId(uid);
  }, []);

  const profileHref = username ? `/profile/${username}` : '/login';

  const navItems = [
    { label: 'Home', icon: LayoutDashboard, href: '/' },
    { label: 'Search', icon: Search, href: '/search' },
    { label: 'My Lists', icon: Star, href: '/lists' },
    { label: 'Profile', icon: User, href: profileHref },
  ];

  const isInListDetail = /^\/lists\/[^\/]+/.test(pathname);
  const listIdMatch = pathname.match(/^\/lists\/([^\/]+)/);
  const listId = listIdMatch ? listIdMatch[1] : null;

  const listContext = isInListDetail ? useListContext() : null;
  const filterContext = isInListDetail ? useListFilter() : null;

  const listData = listContext?.listData;
  const setListData = listContext?.setListData;
  const filterType = filterContext?.filterType ?? 'all';
  const setFilterType = filterContext?.setFilterType ?? (() => {});

  const handleLogout = () => {
    ['token', 'username', 'email', 'avatar'].forEach((key) =>
      localStorage.removeItem(key)
    );
    router.push('/login');
  };

  if (isMobile) {
    const itemsToRender = isInListDetail
      ? [
          { label: 'All Media', icon: Film, action: () => setFilterType('all') },
          { label: 'Movies', icon: FilmIcon, action: () => setFilterType('movie') },
          { label: 'TV Shows', icon: Tv, action: () => setFilterType('tv') },
          { label: 'Update', icon: Pencil, action: () => setShowUpdateModal(true) },
          { label: 'Delete', icon: Trash2, action: () => setShowDeleteModal(true) },
        ]
      : navItems.map((item) => ({
          ...item,
          action: () => router.push(item.href),
        }));

    return (
      <>
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around bg-black border-t border-red-800 py-2 md:hidden">
          {itemsToRender.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`flex flex-col items-center text-sm ${
                isInListDetail && filterType.toLowerCase() === item.label.toLowerCase()
                  ? 'text-white'
                  : 'text-red-400 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </nav>

        {showUpdateModal && userId && listId && (
          <ListUpdate
            userId={userId}
            listId={listId}
            initialTitle={listData?.title ?? ''}
            initialDescription={listData?.description ?? ''}
            onClose={() => setShowUpdateModal(false)}
            onSuccess={(updated) => {
              setListData?.(updated);
              setShowUpdateModal(false);
            }}
          />
        )}
        {showDeleteModal && userId && listId && (
          <ListDelete
            userId={userId}
            listId={listId}
            onClose={() => setShowDeleteModal(false)}
            onDeleted={() => {
              setShowDeleteModal(false);
              router.push('/lists');
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Sidebar
        side="left"
        variant="sidebar"
        className="hidden md:flex w-[250px] bg-black text-red-400 border-r border-red-800"
      >
        <SidebarHeader className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Image src="/logo4.svg" alt="MyList Logo" width={44} height={44} />
            <span className="text-xl font-bold tracking-tight">MyList</span>
          </div>
        </SidebarHeader>

        <SidebarSeparator className="h-px bg-red-700 my-1 mx-auto w-[85%]" />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 ${
                          pathname === item.href ? 'bg-gray-800 text-white' : ''
                        }`}
                      >
                        <item.icon size={20} />
                        <span className="text-[15px]">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {isInListDetail && listId && (
            <>
              <SidebarSeparator className="h-px bg-red-700 my-3 mx-auto w-[85%]" />
              <SidebarGroup>
                <SidebarGroupLabel>List Actions</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {['all', 'movie', 'tv'].map((type) => {
                      const Icon = type === 'movie' ? FilmIcon : type === 'tv' ? Tv : Film;
                      const label = type === 'movie' ? 'Movies' : type === 'tv' ? 'TV Shows' : 'All Media';
                      return (
                        <SidebarMenuItem key={type}>
                          <SidebarMenuButton asChild>
                            <button
                              onClick={() => setFilterType(type as 'all' | 'movie' | 'tv')}
                              className={`flex items-center gap-3 px-3 py-2 rounded w-full text-left hover:bg-gray-700 ${
                                filterType === type ? 'bg-gray-800 text-white' : ''
                              }`}
                            >
                              <Icon size={20} />
                              <span className="text-[15px]">{label}</span>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <button
                          onClick={() => setShowUpdateModal(true)}
                          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 w-full text-left"
                        >
                          <Pencil size={20} />
                          <span className="text-[15px]">Update List</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 text-red-500 w-full text-left"
                        >
                          <Trash2 size={20} />
                          <span className="text-[15px]">Delete List</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          )}
        </SidebarContent>

        <SidebarSeparator className="h-px bg-red-700 my-1 mx-auto w-[85%]" />

        <SidebarFooter className="px-4 py-4">
          {avatar && (
            <div className="flex items-center gap-3">
              <Image
                src={`/${avatar}`}
                alt="User Avatar"
                width={53}
                height={53}
                className="rounded-full border border-red-500"
              />
              {username && (
                <span className="text-[15px] font-medium text-red-400 truncate">
                  {username}
                </span>
              )}
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      {showUpdateModal && userId && listId && (
        <ListUpdate
          userId={userId}
          listId={listId}
          initialTitle={listData?.title ?? ''}
          initialDescription={listData?.description ?? ''}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={(updated) => {
            setListData?.(updated);
            setShowUpdateModal(false);
          }}
        />
      )}

      {showDeleteModal && userId && listId && (
        <ListDelete
          userId={userId}
          listId={listId}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => {
            setShowDeleteModal(false);
            router.push('/lists');
          }}
        />
      )}
    </>
  );
}

export default function TailwindSidebarWrapper() {
  return (
    <SidebarProvider>
      <AppSidebar />
    </SidebarProvider>
  );
}
