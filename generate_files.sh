

#!/usr/bin/env bash

set -e

BASE_DIR="."

# Create directories
mkdir -p \
  $BASE_DIR/src/graph \
  $BASE_DIR/src/agents \
  $BASE_DIR/src/memory \
  $BASE_DIR/src/utils \
  $BASE_DIR/scripts \
  $BASE_DIR/config \
  $BASE_DIR/tests

# Create files
touch \
  $BASE_DIR/src/graph/state.py \
  $BASE_DIR/src/graph/nodes.py \
  $BASE_DIR/src/graph/workflow.py \
  $BASE_DIR/src/graph/conditions.py \
  $BASE_DIR/src/agents/planner.py \
  $BASE_DIR/src/agents/narrative.py \
  $BASE_DIR/src/agents/consistency.py \
  $BASE_DIR/src/agents/evolution.py \
  $BASE_DIR/src/memory/vector.py \
  $BASE_DIR/src/memory/graph.py \
  $BASE_DIR/src/memory/temporal.py \
  $BASE_DIR/src/utils/prompts.py \
  $BASE_DIR/src/utils/metrics.py \
  $BASE_DIR/scripts/run_generation.py \
  $BASE_DIR/config/agent_config.yaml \
  $BASE_DIR/config/lore_rules.yaml \
  $BASE_DIR/tests/test_graph.py

echo "Project structure created: $BASE_DIR"
