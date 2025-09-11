#!/usr/bin/env python3
"""
VCAAS Deployment Script
Starts both backend API and frontend development servers
"""

import subprocess
import time
import sys
import os
import requests
from pathlib import Path

def check_requirements():
    """Check if required tools are available"""
    print("🔍 Checking requirements...")
    
    # Check Python
    try:
        result = subprocess.run([sys.executable, "--version"], capture_output=True, text=True)
        print(f"✅ Python: {result.stdout.strip()}")
    except Exception as e:
        print(f"❌ Python not found: {e}")
        return False
    
    # Check Node.js
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True, shell=True)
        print(f"✅ Node.js: {result.stdout.strip()}")
    except Exception as e:
        print(f"❌ Node.js not found: {e}")
        return False
    
    # Check npm
    try:
        result = subprocess.run(["npm", "--version"], capture_output=True, text=True, shell=True)
        print(f"✅ npm: {result.stdout.strip()}")
    except Exception as e:
        print(f"❌ npm not found: {e}")
        return False
    
    return True

def start_backend():
    """Start the backend API server"""
    print("🚀 Starting VCAAS Backend API...")
    
    backend_script = Path("backend/vcaas_server.py")
    if not backend_script.exists():
        # Try alternative path
        backend_script = Path("vcaas_server.py")
        if not backend_script.exists():
            print("❌ Backend script not found!")
            print(f"   Looked for: {Path('backend/vcaas_server.py').absolute()}")
            print(f"   Also tried: {Path('vcaas_server.py').absolute()}")
            return None
    
    try:
        # Start backend in a subprocess
        process = subprocess.Popen([
            sys.executable, str(backend_script)
        ], cwd=os.getcwd())
        
        # Wait for backend to start
        print("⏳ Waiting for backend to start...")
        for i in range(10):  # Wait up to 10 seconds
            try:
                response = requests.get("http://localhost:8000/health", timeout=2)
                if response.status_code == 200:
                    print("✅ Backend API is running on http://localhost:8000")
                    print("📋 API Documentation: http://localhost:8000/docs")
                    return process
            except requests.exceptions.RequestException:
                time.sleep(1)
        
        print("⚠️  Backend may still be starting...")
        return process
        
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return None

def start_frontend():
    """Start the frontend development server"""
    print("🌐 Starting VCAAS Frontend...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found!")
        return None
    
    try:
        # Change to frontend directory and start npm dev
        process = subprocess.Popen([
            "npm", "run", "dev"
        ], cwd=frontend_dir, shell=True)
        
        print("⏳ Starting Next.js development server...")
        print("🌐 Frontend will be available at http://localhost:3000")
        return process
        
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return None

def wait_for_frontend():
    """Wait for frontend to be ready"""
    print("⏳ Waiting for frontend to be ready...")
    for i in range(30):  # Wait up to 30 seconds
        try:
            response = requests.get("http://localhost:3000", timeout=5)
            if response.status_code == 200:
                print("✅ Frontend is ready at http://localhost:3000")
                return True
        except requests.exceptions.RequestException:
            time.sleep(1)
    
    print("⚠️  Frontend may still be compiling...")
    return False

def main():
    """Main deployment function"""
    print("🎙️  VCAAS - Voice Cloning as a Service")
    print("=" * 50)
    
    if not check_requirements():
        print("❌ Requirements not met. Please install Python and Node.js")
        return
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        print("❌ Failed to start backend")
        return
    
    # Start frontend
    frontend_process = start_frontend()
    if not frontend_process:
        print("❌ Failed to start frontend")
        backend_process.terminate()
        return
    
    # Wait a bit for frontend to compile
    wait_for_frontend()
    
    print("\n🎉 VCAAS is now running!")
    print("📋 Access points:")
    print("   • Frontend (Main App): http://localhost:3000")
    print("   • Backend API: http://localhost:8000")
    print("   • API Documentation: http://localhost:8000/docs")
    print("   • Dashboard: http://localhost:3000/dashboard")
    print("   • Voice Training: http://localhost:3000/training")
    print("   • TTS Playground: http://localhost:3000/playground")
    
    print("\\n🛑 Press Ctrl+C to stop both servers")
    
    try:
        # Wait for user to stop
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\\n🛑 Stopping VCAAS...")
        frontend_process.terminate()
        backend_process.terminate()
        
        # Wait for processes to terminate
        frontend_process.wait()
        backend_process.wait()
        
        print("✅ VCAAS stopped successfully")

if __name__ == "__main__":
    main()
