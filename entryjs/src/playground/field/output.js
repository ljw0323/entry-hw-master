/*
 */
'use strict';
/*
 *
 */
Entry.FieldOutput = function(content, blockView, index, mode, contentIndex) {
    Entry.Model(this, false);

    this._blockView = blockView;
    this._block = blockView.block;
    this._valueBlock = null;

    this.box = new Entry.BoxModel();
    this.changeEvent = new Entry.Event(this);

    this._index = index;
    this.contentIndex = contentIndex;
    this._content = content;

    this.acceptType = content.accept;

    this.view = this;

    this.svgGroup = null;

    this._position = content.position;

    this.box.observe(blockView, 'dAlignContent', ['width', 'height']);
    this.observe(this, '_updateBG', ['magneting'], false);

    this.renderStart(blockView.getBoard(), mode);
};

Entry.Utils.inherit(Entry.Field, Entry.FieldOutput);

(function(p) {
    p.schema = { magneting: false };

    p.renderStart = function(board, mode) {
        if (!this.svgGroup) {
            this.svgGroup = this._blockView.contentSvgGroup.elem('g');
        }

        this.view = this;
        this._nextGroup = this.svgGroup;

        const block = this.getValue();
        if (block && !block.view) {
            block.setThread(this);
            block.createView(board, mode);
        }

        this._updateValueBlock(block);
        this._valueBlock && this._valueBlock.view._startContentRender(this.renderMode);

        if (this._blockView.getBoard().constructor == Entry.BlockMenu && this._valueBlock) {
            this._valueBlock.view.removeControl();
        }
    };

    p.align = function(x, y, animate) {
        animate = animate === undefined ? true : animate;
        const svgGroup = this.svgGroup;
        if (this._position) {
            if (this._position.x) {
                x = this._position.x;
            }
            if (this._position.y) {
                y = this._position.y;
            }
        }

        const block = this._valueBlock;

        if (block && block.view) {
            y = block.view.height * -0.5;
        }

        const transform = `translate(${x},${y})`;

        if (animate) {
            svgGroup.animate(
                {
                    transform,
                },
                300,
                mina.easeinout
            );
        } else {
            svgGroup.attr({
                transform,
            });
        }

        this.box.set({ x, y });
    };

    p.calcWH = function() {
        const block = this._valueBlock;
        const blockView = block && block.view;

        if (block && blockView) {
            this.box.set({
                width: blockView.width,
                height: blockView.height,
            });
        } else {
            this.box.set({
                width: 0,
                height: 20,
            });
        }
    };

    p.calcHeight = p.calcWH;

    p.destroy = function() {
        this._valueBlock && this._valueBlock.destroyView();
    };

    p._inspectBlock = function() {};

    p._setValueBlock = function(block) {
        if (block != this._valueBlock || !this._valueBlock) {
            this._valueBlock = block;
            this.setValue(block);

            block && block.setThread(this);
            return this._valueBlock;
        }
    };

    p.spliceBlock = function() {
        this._updateValueBlock();
    };

    p._updateValueBlock = function(block) {
        if (!(block instanceof Entry.Block)) {
            block = undefined;
        }

        if (block && block === this._valueBlock) {
            this.calcWH();
            return;
        }

        this._sizeObserver && this._sizeObserver.destroy();
        this._posObserver && this._posObserver.destroy();

        block = this._setValueBlock(block);
        if (block) {
            const view = block.view;
            view.bindPrev();
            this._posObserver = view.observe(this, '_updateValueBlock', ['x', 'y'], false);
            this._sizeObserver = view.observe(this, 'calcWH', ['width', 'height']);
        } else {
            this.calcWH();
        }

        this._blockView.dAlignContent();
    };

    p.getPrevBlock = function(block) {
        if (this._valueBlock === block) {
            return this;
        } else {
            return null;
        }
    };

    p.getNextBlock = function() {
        return null;
    };

    p.requestAbsoluteCoordinate = function(blockView) {
        const board = this.getBoard();
        const { scale = 1 } = board || {};
        var blockView = this._blockView;
        const contentPos = blockView.contentPos;
        const pos = blockView.getAbsoluteCoordinate();
        pos.x += (this.box.x + contentPos.x) * scale;
        pos.y += this.box.y + contentPos.y;
        return pos;
    };

    p.dominate = function() {
        this._blockView.dominate();
    };

    p.isGlobal = function() {
        return false;
    };

    p.separate = function(block) {
        this.getCode().createThread([block]);
        this._updateValueBlock(null);
        this.changeEvent.notify();
    };

    p.getCode = function() {
        return this._block.thread.getCode();
    };

    p.cut = function(block) {
        if (this._valueBlock === block) {
            delete this._valueBlock;
            return [block];
        } else {
            return null;
        }
    };

    p._updateBG = function() {
        if (this.magneting) {
            this._bg = this.svgGroup.elem('path', {
                d: 'm -4,-12 h 3 l 2,2 0,3 3,0 1,1 0,12 -1,1 -3,0 0,3 -2,2 h -3 ',
                fill: '#fff',
                stroke: '#fff',
                'fill-opacity': 0.7,
                transform: `translate(0,${this._valueBlock ? 12 : 0})`,
            });
        } else {
            if (this._bg) {
                this._bg.remove();
                delete this._bg;
            }
        }
    };

    p.replace = function(block) {
        const valueBlock = this._valueBlock;
        if (valueBlock) {
            valueBlock.view._toGlobalCoordinate();
            block.getTerminateOutputBlock().view._contents[1].replace(valueBlock);
        }
        this._updateValueBlock(block);
        block.view._toLocalCoordinate(this);
        this.calcWH();
    };

    p.setParent = function(parent) {
        this._parent = parent;
    };

    p.getParent = function() {
        return this._parent;
    };

    p.getThread = function() {
        return this;
    };

    p.getValueBlock = function() {
        return this._valueBlock;
    };

    p.pointer = function(pointer) {
        pointer = pointer || [];
        pointer.unshift(this._index);
        pointer.unshift(Entry.PARAM);
        return this._block.pointer(pointer);
    };

    p.isParamBlockType = _.constant(true);
})(Entry.FieldOutput.prototype);
