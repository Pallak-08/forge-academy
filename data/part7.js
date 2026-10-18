/* Forge Academy course data, modules 24-25 (wave 1 additions) */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 24, id: "dsa", title: "Data structures and algorithms", level: 1,
  blurb: "The patterns behind most coding interviews, and behind code that stays fast as data grows.",
  saas: "SaaSForge uses dicts as lookup tables everywhere (entity by name, table by name), sets for de-duplication and queues for jobs: the same structures interviews ask about.",
  lessons: [
    {
      t: "Big-O, arrays and hash maps",
      sub: ["Big-O: how cost grows with input size", "O(1), O(log n), O(n), O(n log n), O(n²)", "Arrays and strings", "Hash maps and sets: O(1) lookups", "Classic: two-sum, anagrams, frequency counts"],
      body: `<p><b>Big-O</b> describes how running time or memory grows as the input grows, ignoring constants. Looping over a list once is O(n); a loop inside a loop is O(n²); looking up a key in a dict is O(1) on average.</p>
<p>The single most useful interview trick is replacing a nested search with a <b>hash map</b>. Instead of checking every pair (O(n²)), remember what you have seen in a dict and look it up in O(1), giving O(n) overall.</p>`,
      lang: "python",
      code: `from collections import Counter

def two_sum_slow(nums: list[int], target: int) -> tuple[int, int] | None:
    for i in range(len(nums)):                 # O(n²)
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return i, j
    return None

def two_sum(nums: list[int], target: int) -> tuple[int, int] | None:
    seen: dict[int, int] = {}                  # value -> index
    for i, x in enumerate(nums):               # O(n) time, O(n) space
        if target - x in seen:
            return seen[target - x], i
        seen[x] = i
    return None

def is_anagram(a: str, b: str) -> bool:
    return Counter(a.replace(" ", "").lower()) == Counter(b.replace(" ", "").lower())

def first_unique_char(s: str) -> int:
    counts = Counter(s)
    return next((i for i, c in enumerate(s) if counts[c] == 1), -1)

print(two_sum([2, 7, 11, 15], 9), is_anagram("Listen", "Silent"), first_unique_char("swiss"))`,
      ex: "Solve without looking anything up: (1) does an array contain duplicates? (2) group a list of words into anagram groups, (3) find the most frequent element. State time and space complexity for each.",
      q: ["What is the time complexity of looking up a key in a Python dict, on average?", ["O(n)", "O(log n)", "O(1)", "O(n²)"], 2, "Hash tables give constant average-time lookups."]
    },
    {
      t: "Two pointers, sliding window and binary search",
      sub: ["Two pointers on sorted arrays", "Sliding window for subarrays and substrings", "Binary search and its off-by-one traps", "Searching on the answer", "Recognising which pattern fits"],
      body: `<p>Many array and string problems fall into a few patterns. <b>Two pointers</b> move inward from both ends of a sorted array. A <b>sliding window</b> grows and shrinks a range to find the best subarray without re-scanning. <b>Binary search</b> halves the search space each step, giving O(log n).</p>
<p>When you read a problem, ask: is the input sorted? Am I looking for a contiguous range? Can I check a candidate answer quickly? Those questions point to the pattern.</p>`,
      lang: "python",
      code: `def is_palindrome(s: str) -> bool:
    chars = [c.lower() for c in s if c.isalnum()]
    i, j = 0, len(chars) - 1
    while i < j:                                # two pointers
        if chars[i] != chars[j]:
            return False
        i, j = i + 1, j - 1
    return True

def longest_unique_substring(s: str) -> int:
    last, start, best = {}, 0, 0
    for i, c in enumerate(s):                   # sliding window
        if c in last and last[c] >= start:
            start = last[c] + 1                 # shrink past the repeat
        last[c] = i
        best = max(best, i - start + 1)
    return best

def binary_search(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

print(is_palindrome("A man, a plan, a canal: Panama"), longest_unique_substring("abcabcbb"), binary_search([1, 3, 5, 7, 9], 7))`,
      ex: "Solve: (1) container with most water (two pointers), (2) maximum sum of any k consecutive numbers (sliding window), (3) first position of a target in a sorted array with duplicates (binary search).",
      q: ["Which pattern best fits 'longest substring with at most 2 distinct characters'?", ["Binary search", "Sliding window", "Sorting", "Recursion"], 1, "It asks for the best contiguous range, the signature of a sliding window."]
    },
    {
      t: "Stacks, queues, trees and graphs",
      sub: ["Stacks (LIFO) and queues (FIFO)", "Linked lists in brief", "Binary trees and traversals", "Graphs: adjacency lists", "BFS and DFS"],
      body: `<p>A <b>stack</b> (last in, first out) is perfect for matching brackets and undo. A <b>queue</b> (first in, first out) powers breadth-first search and job processing.</p>
<p><b>Trees</b> and <b>graphs</b> model hierarchies and networks. Store a graph as an adjacency list (a dict of neighbours). <b>BFS</b> explores level by level with a queue and finds shortest paths in unweighted graphs; <b>DFS</b> goes deep first with recursion or a stack.</p>`,
      lang: "python",
      code: `from collections import deque

def balanced(s: str) -> bool:
    pairs, stack = {")": "(", "]": "[", "}": "{"}, []
    for c in s:
        if c in "([{":
            stack.append(c)
        elif c in pairs:
            if not stack or stack.pop() != pairs[c]:
                return False
    return not stack

graph = {"A": ["B", "C"], "B": ["D"], "C": ["D", "E"], "D": ["F"], "E": ["F"], "F": []}

def shortest_path(start: str, goal: str) -> list[str] | None:
    queue, parent = deque([start]), {start: None}
    while queue:                                # BFS
        node = queue.popleft()
        if node == goal:
            path = []
            while node:
                path.append(node); node = parent[node]
            return path[::-1]
        for nxt in graph[node]:
            if nxt not in parent:
                parent[nxt] = node
                queue.append(nxt)
    return None

def dfs(node: str, seen: set[str] | None = None) -> list[str]:
    seen = seen if seen is not None else set()
    seen.add(node)
    order = [node]
    for nxt in graph[node]:
        if nxt not in seen:
            order += dfs(nxt, seen)
    return order

class Node:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def depth(n: Node | None) -> int:
    return 0 if n is None else 1 + max(depth(n.left), depth(n.right))

print(balanced("{[()]}"), shortest_path("A", "F"), dfs("A"), depth(Node(1, Node(2, Node(4)), Node(3))))`,
      ex: "Solve: (1) number of islands in a grid of 0s and 1s (BFS or DFS), (2) level-order traversal of a binary tree, (3) detect a cycle in a directed graph.",
      q: ["Which algorithm finds the shortest path in an unweighted graph?", ["DFS", "BFS", "Binary search", "Bubble sort"], 1, "BFS visits nodes in order of distance from the start."]
    },
    {
      t: "Recursion, sorting and dynamic programming",
      sub: ["Recursion: base case and recursive case", "Merge sort and why it is O(n log n)", "Memoisation", "Dynamic programming: overlapping subproblems", "Classic DP: climbing stairs, coin change"],
      body: `<p><b>Recursion</b> solves a problem by solving smaller versions of it. Every recursive function needs a <b>base case</b> that stops it. Merge sort splits a list in half, sorts each half recursively and merges them: O(n log n).</p>
<p><b>Dynamic programming</b> applies when the same subproblems repeat. Store their answers (memoisation, top-down) or fill a table from small to large (bottom-up). Turning an exponential recursion into a linear one this way is a common interview moment.</p>`,
      lang: "python",
      code: `from functools import cache

def merge_sort(xs: list[int]) -> list[int]:
    if len(xs) <= 1:
        return xs                               # base case
    mid = len(xs) // 2
    left, right = merge_sort(xs[:mid]), merge_sort(xs[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    return out + left[i:] + right[j:]

@cache
def climb(n: int) -> int:
    """Ways to climb n stairs taking 1 or 2 steps."""
    return 1 if n <= 1 else climb(n - 1) + climb(n - 2)

def coin_change(coins: list[int], amount: int) -> int:
    best = [0] + [amount + 1] * amount          # best[a] = fewest coins for a
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                best[a] = min(best[a], best[a - c] + 1)
    return best[amount] if best[amount] <= amount else -1

print(merge_sort([5, 2, 9, 1, 5, 6]), climb(40), coin_change([1, 5, 10, 25], 63))`,
      ex: "Solve: (1) house robber (max sum of non-adjacent numbers), (2) longest common subsequence of two strings, (3) generate all subsets of a list with recursion. Write both a memoised and a bottom-up version for (1).",
      q: ["What makes a problem a good fit for dynamic programming?", ["It uses graphs", "It has overlapping subproblems whose answers can be reused", "The input is sorted", "It needs a stack"], 1, "DP reuses answers to repeated subproblems instead of recomputing them."]
    }
  ]
});

COURSE.push({
  n: 25, id: "nosql", title: "NoSQL databases", level: 2,
  blurb: "Document and key-value stores: when they fit better than tables, and how to model data for them.",
  saas: "SaaSForge stores job history as JSON documents on disk, a simple form of a document store.",
  lessons: [
    {
      t: "Document databases and choosing SQL vs NoSQL",
      sub: ["Document model: JSON-like records", "MongoDB basics: insert, find, update, indexes", "Embedding vs referencing", "Consistency and transactions", "A decision guide: SQL or NoSQL"],
      body: `<p>A <b>document database</b> such as MongoDB stores JSON-like documents. Related data that is always read together can be <b>embedded</b> in one document (a post with its tags), while large or shared data is <b>referenced</b> by id (a post's author).</p>
<p>Choose SQL when data is relational, needs joins, strong consistency and transactions across many records (payments, inventory). Choose a document store when records are self-contained, the shape varies, and you mostly read one document at a time (content, catalogues, event logs). Many products use both: Postgres for core data, Redis for caching, a document store for flexible content.</p>`,
      lang: "python",
      code: `# docker run -p 27017:27017 mongo:7      pip install pymongo
from datetime import datetime, timezone
from pymongo import MongoClient, ASCENDING

db = MongoClient("mongodb://localhost:27017")["blog"]

db.posts.create_index([("tags", ASCENDING)])
db.posts.create_index([("author_id", ASCENDING), ("created_at", -1)])

post_id = db.posts.insert_one({
    "title": "Learning NoSQL",
    "author_id": 7,                                   # reference: authors live elsewhere
    "tags": ["databases", "mongodb"],                 # embedded: always read with the post
    "comments": [{"user": "priya", "text": "Great post!"}],
    "created_at": datetime.now(timezone.utc),
}).inserted_id

for p in db.posts.find({"tags": "mongodb"}, {"title": 1, "_id": 0}):
    print(p)

db.posts.update_one({"_id": post_id}, {"$push": {"comments": {"user": "rohit", "text": "Thanks"}}})

pipeline = [                                          # like GROUP BY
    {"$unwind": "$tags"},
    {"$group": {"_id": "$tags", "posts": {"$sum": 1}}},
    {"$sort": {"posts": -1}},
]
print(list(db.posts.aggregate(pipeline)))

# Rule of thumb: embed what you read together and is bounded in size;
# reference what is shared, large or unbounded (e.g. millions of comments).`,
      ex: "Model the same blog (users, posts, comments, tags) in Postgres and in MongoDB. Implement 'latest 10 posts with author name and comment count' in both and write a half-page comparison.",
      q: ["When is embedding usually right in a document database?", ["When data is shared by many documents", "When data is read together and bounded in size", "When data grows without limit", "Always"], 1, "Embed small, owned, co-read data; reference shared or unbounded data."]
    }
  ]
});
