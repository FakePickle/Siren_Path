
class Node {
    constructor(x, y, walkable) {
        this.x = x;
        this.y = y;
        this.walkable = walkable;
        this.g = 0;
        this.h = 0;
        this.f = 0;
        this.parent = null;
    }
}

function calculateDistanceUsingAStar(startX, startY, endX, endY, grid) {
    const openList = [];
    const closedList = [];

    const startNode = new Node(startX, startY, true);
    const endNode = new Node(endX, endY, true);

    openList.push(startNode);

    while (openList.length > 0) {
        let currentNode = openList[0];
        let currentIndex = 0;

        // Find the node with the lowest f cost in the open list
        for (let i = 0; i < openList.length; i++) {
            if (openList[i].f < currentNode.f) {
                currentNode = openList[i];
                currentIndex = i;
            }
        }

        openList.splice(currentIndex, 1);
        closedList.push(currentNode);

        // Reached the end node
        if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
            const path = [];
            let current = currentNode;
            while (current !== null) {
                path.push({ x: current.x, y: current.y });
                current = current.parent;
            }
            return path.reverse();
        }

        const neighbors = [];
        // Add neighboring nodes here based on your grid or map

        for (let i = 0; i < neighbors.length; i++) {
            const neighbor = neighbors[i];

            if (!neighbor.walkable || closedList.some((node) => node.x === neighbor.x && node.y === neighbor.y)) {
                continue;
            }

            const gScore = currentNode.g + 1;
            let isBetter = false;

            if (!openList.some((node) => node.x === neighbor.x && node.y === neighbor.y)) {
                openList.push(neighbor);
                isBetter = true;
            } else if (gScore < neighbor.g) {
                isBetter = true;
            }

            if (isBetter) {
                neighbor.parent = currentNode;
                neighbor.g = gScore;
                neighbor.h = calculateHeuristic(neighbor, endNode);
                neighbor.f = neighbor.g + neighbor.h;
            }
        }
    }

    // No path found
    return null;
}

function calculateHeuristic(node, endNode) {
    // Calculate the Manhattan distance (or any other suitable heuristic)
    return Math.abs(node.x - endNode.x) + Math.abs(node.y - endNode.y);
}

