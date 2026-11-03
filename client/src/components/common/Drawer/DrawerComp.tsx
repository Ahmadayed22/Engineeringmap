import CommentForm from '@components/Feature/comment/CommentForm';
import CommentSection from '@components/Feature/comment/CommentSection';
import MaterialSection from '@components/Feature/Material/MaterialSection';
import { Button, Drawer, DrawerHeader, DrawerItems } from 'flowbite-react';
import React, { useState } from 'react';
import MarkModal from '../Modal/MarkModal';
import { useAuth } from '@hooks/CustomHook/useAuth';
import { useTreeFlowContext } from '@context/TreeFlowContext';

type Tab = 'comments' | 'materials';

const TABS: { id: Tab; label: string }[] = [
  { id: 'comments', label: 'Comments' },
  { id: 'materials', label: 'Materials' },
];

function DrawerComp() {
  const [activeTab, setActiveTab] = useState<Tab>('comments');
  const [openMark, setOpenMark] = useState<boolean>(false);
  const { accessToken } = useAuth();
  // Read straight from context. This used to call useTreeFlow(), which spun up a second
  // copy of the whole map state and its queries just to get setDrawerOpen.
  const { courseId, title, drawerOpen, setDrawerOpen } = useTreeFlowContext();

  return (
    <div className="relative z-100">
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        position="right"
        className="w-full sm:max-w-sm md:max-w-xl lg:max-w-2xl !bg-[#171717]"
      >
        <div className="flex h-full w-full flex-col">
          <DrawerHeader title={typeof title === 'string' ? title : undefined} />

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
            <div
              role="tablist"
              aria-label="Course sections"
              className="inline-flex rounded-lg border border-neutral-700 bg-neutral-900 p-1"
            >
              {TABS.map((tab) => {
                const selected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-selected={selected}
                    aria-controls={`panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 ${
                      selected
                        ? 'bg-neutral-700 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {accessToken && (
              <Button
                size="sm"
                color="alternative"
                className="cursor-pointer"
                onClick={() => setOpenMark(true)}
              >
                Add my grade
              </Button>
            )}
          </div>

          <DrawerItems
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="flex-1 overflow-y-auto p-4"
          >
            {activeTab === 'comments' ? (
              <CommentSection />
            ) : (
              <MaterialSection />
            )}
          </DrawerItems>

          {activeTab === 'comments' && <CommentForm courseId={courseId} />}
        </div>

        <MarkModal setOpenModal={setOpenMark} openModal={openMark} />
      </Drawer>
    </div>
  );
}

export default React.memo(DrawerComp);
