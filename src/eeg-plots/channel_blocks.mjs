export default function channelBlocks(channels, order) {
    // Annotations are relevant to a list of channels. However, most
    // of the time, this list is composed of a small number of blocks
    // of channels. For instance, if an annotation is relevant to the
    // left side, then the annotation will be a single rectangles
    // spanning over the left channels. If it is localized both on the
    // left and on the right, then there will be 2 rectangles: one
    // spanning the left channels, and the other spanning the right
    // channels, but the center channels won’t be highlighted.
    const margin = 0.05;
    const channelPaperWidth = (1 - 2 * margin) / order.length;
    const blockMargin = 0.1 * channelPaperWidth;
    // To have the whole signal fit into the rect without touching
    // its top and bottom borders, we make it slightly bigger.
    let blocks = [];
    // The channel names are order, from bottom to top on the graph
    // paper.
    let nextBlock = false;
    for (let index = 0; index < order.length; index++) {
	const inBlock = channels.includes(order[index]);
	const hasNextBlock = (nextBlock != false);
	if (inBlock && !hasNextBlock) {
	    // Start a new block
	    nextBlock = {
		yStart: margin + index * channelPaperWidth - blockMargin
	    };
	} else if (!inBlock && hasNextBlock) {
	    // Close the block
	    nextBlock.yEnd = margin + index * channelPaperWidth + blockMargin;
	    blocks.push(nextBlock);
	    nextBlock = false;
	}
    }
    const blockStillOpened = (nextBlock != false);
    if (blockStillOpened) {
	nextBlock.yEnd = margin + channelPaperWidth * order.length + blockMargin;
	blocks.push(nextBlock);
    }
    return blocks;
}

// Local Variables:
// mode: js
// End:
