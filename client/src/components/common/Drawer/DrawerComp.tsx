'use client';
import type { Node } from '@xyflow/react';
import {
  Button,
  Drawer,
  DrawerHeader,
  DrawerItems,
  // Label,
  Textarea,
} from 'flowbite-react';

// import { HiEnvelope } from 'react-icons/hi2';

type DrawerCompProps = {
  isOpen: boolean;
  onClose: () => void;
  node: Node | null;
};

export function DrawerComp({ isOpen, onClose, node }: DrawerCompProps) {
  return (
    <div className="relative">
      <Drawer
        open={isOpen}
        onClose={onClose}
        position="right"
        className="w-full sm:max-w-sm md:max-w-xl lg:max-w-2xl "
      >
        <div className="flex flex-col h-full w-full">
          {/* Header */}
          <DrawerHeader
            title={node?.id || 'Node Info'}
            // titleIcon={HiEnvelope}
          />

          {/* Content Area (scrollable) */}
          <DrawerItems className="flex-1 overflow-y-auto p-4">
            {/* You can place any node details here */}
          </DrawerItems>

          {/* Sticky Bottom Form */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="p-4 border-t w-full"
          >
            <div className="mb-4">
              <Textarea
                id="message"
                name="message"
                placeholder="Write Comment..."
                rows={2}
              />
            </div>
            <Button type="submit" className="w-full">
              Comment
            </Button>
          </form>
        </div>
      </Drawer>
    </div>
  );
}
